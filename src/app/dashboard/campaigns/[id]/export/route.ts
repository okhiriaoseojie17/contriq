import { createClient } from "@/lib/supabase/server";

// Spreadsheet apps can run text that starts with = + - or @ as a formula.
// Payer names and emails are typed by strangers, so we neutralise those
// and wrap every cell in quotes.
function csvCell(value: string | number | null | undefined) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Only the campaign's own organizer can export.
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, slug")
    .eq("id", id)
    .eq("organizer_id", user.id)
    .maybeSingle();

  if (!campaign) {
    return new Response("Not found", { status: 404 });
  }

  const { data: payments, error } = await supabase
    .from("payments")
    .select("reference, amount, payer_name, payer_email, status, created_at, paid_at")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Could not load payments", { status: 500 });
  }

  const header = [
    "Name",
    "Email",
    "Amount (NGN)",
    "Status",
    "Reference",
    "Created at",
    "Paid at",
  ];

  const rows = (payments ?? []).map((p) =>
    [
      csvCell(p.payer_name),
      csvCell(p.payer_email),
      csvCell(p.amount / 100),
      csvCell(p.status),
      csvCell(p.reference),
      csvCell(p.created_at),
      csvCell(p.paid_at),
    ].join(",")
  );

  // The leading \uFEFF helps Excel read the file as UTF-8.
  const csv = "\uFEFF" + [header.map(csvCell).join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contriq-${campaign.slug}-payments.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
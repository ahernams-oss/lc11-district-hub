import QRCode from "qrcode";

const PIX_KEY = "27784685000160";
const PIX_MERCHANT_NAME = "Distrito LC-11";
const PIX_MERCHANT_CITY = "Rio de Janeiro";

function padLen(value: string): string {
  return value.length.toString().padStart(2, "0");
}

function buildField(id: string, value: string): string {
  return `${id}${padLen(value)}${value}`;
}

function crc16Ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(amountInCents?: number): string {
  const gui = buildField("00", "br.gov.bcb.pix");
  const key = buildField("01", PIX_KEY);
  const merchantAccount = buildField("26", `${gui}${key}`);

  const payloadParts: string[] = [
    buildField("00", "01"),
    merchantAccount,
    buildField("52", "0000"),
    buildField("53", "986"),
  ];

  if (amountInCents && amountInCents > 0) {
    const amount = (amountInCents / 100).toFixed(2);
    payloadParts.push(buildField("54", amount));
  }

  payloadParts.push(buildField("58", "BR"));
  payloadParts.push(buildField("59", PIX_MERCHANT_NAME));
  payloadParts.push(buildField("60", PIX_MERCHANT_CITY));
  payloadParts.push(buildField("62", buildField("05", "***")));

  const payloadWithoutCrc = payloadParts.join("");
  const crc = crc16Ccitt(`${payloadWithoutCrc}6304`);
  return `${payloadWithoutCrc}6304${crc}`;
}

export async function generatePixQrCode(amountInCents?: number): Promise<string> {
  const payload = buildPixPayload(amountInCents);
  return QRCode.toDataURL(payload, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

export function getPixCopyPaste(amountInCents?: number): string {
  return buildPixPayload(amountInCents);
}

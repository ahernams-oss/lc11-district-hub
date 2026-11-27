import { describe, test } from "node:test";
import { deepStrictEqual, ok, strictEqual } from "node:assert";
import { PROTOCOL_MENU_ITEMS } from "./protocol-menu";
import { ADMIN_REPORT_SOURCES } from "./admin-report-model";
import {
  EMPTY_PROTOCOL_TOPIC,
  PROTOCOL_TOPIC_KEY_PREFIX,
  isKnownProtocolSlug,
  isProtocolTopicKey,
  normalizeProtocolTopic,
  protocolTopicKey,
  protocolTopicSlugFromKey,
  protocolTopicStatus,
} from "./protocol-content";

describe("Conteúdo dos temas de Protocolo Leonístico", () => {
  test("cada um dos 17 temas tem uma chave própria e diferente", () => {
    const keys = PROTOCOL_MENU_ITEMS.map((item) => protocolTopicKey(item.slug));
    strictEqual(keys.length, 17);
    strictEqual(new Set(keys).size, 17);
    ok(keys.every((key) => key.startsWith(PROTOCOL_TOPIC_KEY_PREFIX)));
  });

  test("a chave devolve o tema original e descarta chaves de outras áreas", () => {
    const slug = PROTOCOL_MENU_ITEMS[0].slug;
    strictEqual(protocolTopicSlugFromKey(protocolTopicKey(slug)), slug);
    strictEqual(isProtocolTopicKey("protocolo_topic_" + slug), true);
    strictEqual(isProtocolTopicKey("conexao-solidaria"), false);
    strictEqual(isProtocolTopicKey("lideres-dmlc"), false);
    strictEqual(protocolTopicSlugFromKey("conexao-solidaria"), "");
  });

  test("slug desconhecido não é aceito nem para salvar", () => {
    strictEqual(isKnownProtocolSlug(PROTOCOL_MENU_ITEMS[0].slug), true);
    strictEqual(isKnownProtocolSlug("pagina-que-nao-existe"), false);
  });

  test("normalização mantém apenas imagens válidas e exige publicado explícito", () => {
    const content = normalizeProtocolTopic({
      title: "Hinos",
      images: ["https://x/a.jpg", "", 42, null, "https://x/b.jpg"],
      published: "sim",
    });
    strictEqual(content.title, "Hinos");
    deepStrictEqual(content.images, ["https://x/a.jpg", "https://x/b.jpg"]);
    strictEqual(content.published, false);
    strictEqual(normalizeProtocolTopic(null).published, false);
  });

  test("status do tema: sem conteúdo, rascunho ou publicado", () => {
    strictEqual(protocolTopicStatus(EMPTY_PROTOCOL_TOPIC), "vazio");
    strictEqual(protocolTopicStatus({ ...EMPTY_PROTOCOL_TOPIC, body: "Texto" }), "rascunho");
    strictEqual(protocolTopicStatus({ ...EMPTY_PROTOCOL_TOPIC, body: "Texto", published: true }), "publicado");
    strictEqual(protocolTopicStatus({ ...EMPTY_PROTOCOL_TOPIC, images: ["https://x/a.jpg"] }), "rascunho");
  });

  test("relatório de protocolo exporta apenas as chaves dos temas", () => {
    const source = ADMIN_REPORT_SOURCES.find((item) => item.id === "protocolo");
    ok(source, "área de relatório deve existir");
    strictEqual(source?.table, "site_content");
    strictEqual(source?.keyPrefix, PROTOCOL_TOPIC_KEY_PREFIX);
    const keys = [...PROTOCOL_MENU_ITEMS.map((item) => protocolTopicKey(item.slug)), "conexao-solidaria", "home", "idll"];
    const exported = keys.filter((key) => key.startsWith(source?.keyPrefix ?? ""));
    strictEqual(exported.length, 17);
    ok(exported.every((key) => isProtocolTopicKey(key)));
  });
});

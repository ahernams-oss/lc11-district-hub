import { describe, expect, test } from "bun:test";
import { pageSlug, pagesForMenu, type SitePage } from "./site-pages";

const page = (values: Partial<SitePage>): SitePage => ({ id: "1", title: "Título", slug: "titulo", menu_key: "inicio", menu_label: "Título", description: "", body: "", image_url: "", sort_order: 0, published: false, ...values });
describe("Subpáginas nos menus principais", () => {
  test("rascunhos não aparecem no menu público", () => {
    expect(pagesForMenu([page({ published: false }), page({ id: "2", published: true })], "inicio").map((p) => p.id)).toEqual(["2"]);
  });
  test("cada subpágina aparece somente no menu escolhido", () => {
    expect(pagesForMenu([page({ id: "lider", published: true, menu_key: "lideres" }), page({ id: "inicio", published: true })], "lideres").map((p) => p.id)).toEqual(["lider"]);
  });
  test("ordenação definida no cadastro é respeitada", () => {
    expect(pagesForMenu([page({ id: "ultimo", published: true, sort_order: 2 }), page({ id: "primeiro", published: true, sort_order: 0 })], "inicio").map((p) => p.id)).toEqual(["primeiro", "ultimo"]);
  });
  test("endereço normaliza acentos e espaços", () => {
    expect(pageSlug("Ações do Distrito LC-11")).toBe("acoes-do-distrito-lc-11");
  });
});
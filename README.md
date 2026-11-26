# StoreBooks – Loja online (tema roxo escuro)

CSS Grid (destaque) + TailwindCSS (utilitários, tema, animações) + Bootstrap (navbar, rodapé, offcanvas, modais, toasts).

## Funcionalidades
Busca em tempo real (expande ao focar; Esc limpa), filtro por categoria (chips e cards), ordenação, modal de detalhes, carrinho (adicionar, +/-, remover, limpar, total, salvo no navegador), checkout com validação, newsletter com validação, botão voltar ao topo, redes sociais.

## Imagens
Capas reais carregadas da Open Library (`covers.openlibrary.org`) por ISBN. Se alguma falhar, uma capa SVG de reserva é gerada automaticamente.

## Publicar no GitHub Pages
1. Envie todo o conteúdo da pasta para um repositório (`index.html` na raiz).
2. *Settings → Pages → Deploy from a branch → main → / (root)*.
3. Acesse `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Obs.: Tailwind, Bootstrap, fontes e capas usam CDN, então é preciso internet.

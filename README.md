# 💌 Site Romântico — Guia de Personalização

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `pra-voce`)
2. Faça upload de todos os arquivos desta pasta
3. Vá em **Settings → Pages → Source → main branch → root**
4. Seu site vai estar em: `https://seuusuario.github.io/pra-voce`

---

## 📸 Como adicionar fotos

Coloque suas fotos na pasta `/assets/photos/` com os nomes:

```
hero.jpg       ← foto principal do Hero (vertical, tipo retrato)
photo1.jpg
photo2.jpg
photo3.jpg
...
photo10.jpg
```

**Dica:** Fotos verticais (formato retrato, tipo celular) ficam lindas na galeria.

---

## 🎵 Como adicionar a música

1. Baixe o arquivo de "Te Vivo" — Luan Santana
2. Renomeie para `te-vivo.mp3`
3. Coloque em `/assets/music/te-vivo.mp3`

---

## ✍️ Como editar os textos

Abra os arquivos em `/assets/texts/` e edite com qualquer editor de texto:

| Arquivo | Onde aparece |
|---|---|
| `hero-eyebrow.txt` | Linha pequena acima do título principal |
| `hero-title.txt` | Título grande do Hero |
| `mensagem1.txt` | Primeira mensagem (após o Hero) |
| `mensagem2.txt` | Segunda mensagem (citação em destaque) |
| `mensagem3.txt` | Terceira mensagem |
| `mensagem-final.txt` | Mensagem da seção final |
| `aprendizado1.txt` a `aprendizado4.txt` | Cards "O que aprendi" |
| `futuro1.txt` a `futuro4.txt` | Itens "O que quero construir" |

**Dica:** Parágrafos são separados por linha em branco (Enter duas vezes).

---

## 🗓️ Como editar a Linha do Tempo

Abra o arquivo `index.html` e procure por `<!-- 5. LINHA DO TEMPO -->`.
Edite os `.timeline-card` com suas datas e eventos reais.

---

## 🌐 Servir localmente para testar

Se quiser testar antes de publicar, abra um terminal na pasta do projeto e rode:

```bash
# Com Python 3:
python3 -m http.server 8000

# Depois acesse: http://localhost:8000
```

Sem servidor local, as fotos e textos externos podem não carregar — mas o site funciona normalmente no GitHub Pages.

---

## 💡 Dicas extras

- O site funciona 100% offline após aberto (exceto os textos externos)
- Para adicionar mais fotos na galeria, edite a lista `photoList` em `js/gallery.js`
- Para mudar as cores, edite as variáveis `--rose`, `--gold`, etc. no topo do `css/style.css`
- Para mais eventos na linha do tempo, copie um bloco `.timeline-item` no `index.html`

---

Feito com 💗 especialmente pra ela.

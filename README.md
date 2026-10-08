# Mapa Khatrax

Uma interface interativa de cartografia do Sistema Khatrax, em visual auspex grimdark:
moldura imperial gotica, tela CRT verde, abertura ritual do Adeptus Mechanicus e
arquivos clicaveis de mundos e instalacoes.

## Executar

Abra `index.html` no navegador ou sirva o diretorio com um servidor estatico,
por exemplo `python -m http.server 8000`. Nao precisa de compilacao nem framework.

## Trilha sonora: Noosphere

O player esta integrado ao site e foi configurado para usar exatamente este caminho:

`assets/noosphere.mp3`

O arquivo de audio binario **precisa ser adicionado separadamente** a esse caminho.
No GitHub, abra a pasta `assets`, escolha **Add file > Upload files**, envie
o MP3 com o nome `noosphere.mp3` e confirme o commit na branch `main`.

Depois disso, o navegador tenta iniciar a faixa ao abrir o site. Como a maioria
dos navegadores bloqueia audio automatico, o som tambem e iniciado no primeiro
clique/toque do visitante, ou ao pressionar **ATIVAR CANTICO**. A musica fica em
loop e oferece volume, pausa e retomada.

**Direitos autorais:** a faixa oficial de Warhammer 40,000: Mechanicus pertence
a seus respectivos titulares. Antes de incluir o MP3 em um site distribuido
publicamente, confirme que possui autorizacao/licenca para essa distribuicao.

## Publicacao

Pode ser publicado como site estatico no Netlify ou no GitHub Pages (conforme
as configuracoes de privacidade e elegibilidade do repositorio).
Aponte a hospedagem para a pasta raiz da branch `main`.

## Arquivos

- `index.html`: terminal, moldura, abertura e interfaces
- `styles/boot.css` e `scripts/boot.js`: tela ritual de inicializacao
- `styles/map.css` e `scripts/map.js`: mapa verde interativo e fichas de mundos
- `styles/music.css` e `scripts/music.js`: player da trilha Noosphere
- `assets/`: SVGs e, quando licenciado e disponibilizado, o arquivo `noosphere.mp3`

Projeto pessoal. Nenhum repositorio ou conta profissional e utilizado.

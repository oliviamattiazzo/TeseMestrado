# Escrevendo em LaTeX no VSCode
Não pretendo trocar de computador no meio do caminho, mas acho que é interessante ir anotando as coisas para não me perder (quem sabe não transformar isso em um artigo pro blog depois?).

## Artigos pesquisados
[Writing LaTeX Documents In Visual Studio Code With LaTeX Workshop](https://medium.com/@rcpassos/writing-latex-documents-in-visual-studio-code-with-latex-workshop-d9af6a6b2815), por Rafael "Auyer" Passos

[Getting Started with LaTeX](https://guides.nyu.edu/LaTeX/installation), por NYU Libraries

## Instalando as ferramentas

Fazer download do [MiKTex](https://miktex.org/download) e instalar conforme o Wizard.

Instalar o plugin LaTeX Workshop no VSCode.

## Crie seu arquivo `.tex` e compile

Tá aqui um de exemplo:
```latex
\documentclass{article}
\usepackage{setspace}
\begin{document}
Teste.
\end{document}
```

Para compilar, no Windows, basta ir de `Ctrl + Alt + B`. Você também pode ir na abinha do LaTeX Workshop e compilar por lá.

## Troubleshooting

### O LaTeX Workshop reclamou que não tem pacotes instalados

Não seja como eu: na instalação do MiKTeX, vai ter uma opção sobre a instalação de pacotes *on-the-fly*. Marque que SIM. Vai facilitar muito sua vida.
Caso você tenha instalado sem isso, abra o MiKTeX Console, vá na aba Settings e altere para *Always*. LaTeX já é complicado o suficiente, você não precisa sofrer com mais esse detalhe.

### Tinha outro TeX instalado e quer trocar?

Aconteceu comigo: eu tinha o TinyTeX no computador, e troquei para o MiKTeX. Pra fazer o processo direitinho, segue aqui:

1. Desinstale o TinyTeX (ou o outro TeX que você tenha) apagando as seguintes pastas:

```bash
C:\Users\Seu-Usuario\AppData\Roaming\TinyTeX
C:\Users\Seu-Usuario\AppData\Local\TinyTeX // se existir
```

2. Limpe o PATH

Comece por: `Win + R` → `sysdm.cpl`. Na aba *Advanced*, vá para *Environment Variables*, depois em *User variables* e edite o `Path`, removendo qualquer linha parecida com:

```bash
C:\Users\Seu-Usuario\AppData\Roaming\TinyTeX\bin\windows
```

E adicione o correspondente do MiKTex (algo tipo isso):
```bash
C:\Program Files\MiKTeX\miktex\bin\x64
```

Salve tudo e feche o VS Code se ele estiver aberto. Reinicie qualquer outro Terminal que esteja aberto também, por garantia.

### Erro de Perl

Depois dos passos acima, tentei fazer build no projeto mais uma vez e tive o seguinte erro:

> MiKTeX could not find the script engine 'perl' which is required to execute 'latexmk'.

Conclusão: instale o Perl caso você não tenha instalado. Eu fui no [Strawberry Perl](https://strawberryperl.com/). E novamente: feche e abra seu VSCode novamente.
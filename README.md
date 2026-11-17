<div align="center">

# 🦉 Minerva

**Interface web para conversar com modelos de IA rodando localmente através do Ollama.**

[![Site](https://img.shields.io/badge/Acessar_site-minerva--tau.vercel.app-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://minerva-tau.vercel.app)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## Sobre

Usar IA sem mandar suas conversas para a internet exige rodar o modelo localmente, e as ferramentas
para isso costumam ser de linha de comando. A **Minerva** é um chat no navegador ligado ao
[Ollama](https://ollama.com): você escolhe um dos modelos instalados e conversa, com respostas
formatadas e código destacado.

## Visão Geral

O projeto permite:

- conversar com os modelos instalados no Ollama
- escolher o modelo numa lista carregada do próprio servidor (`/api/tags`)
- ver o status da conexão e quantos modelos estão disponíveis
- ler as respostas renderizadas em **Markdown** (Marked.js)
- ver blocos de código com **destaque de sintaxe** (Highlight.js)

## Stack

- HTML, CSS e JavaScript sem framework
- Marked.js e Highlight.js
- Função serverless na Vercel (`api/ollama.js`) como proxy para o servidor Ollama

## Estrutura

```text
.
|-- index.html
|-- style.css
|-- scripts.js      chat, seleção de modelo e renderização das respostas
`-- api/
    `-- ollama.js   proxy: repassa /api/ollama/* para o servidor Ollama
```

## Como Funciona

```text
Navegador ──► /api/ollama/* (função na Vercel) ──► servidor Ollama
                                                    ├─ /api/tags      lista os modelos
                                                    └─ /api/generate  gera a resposta
```

O proxy evita problemas de CORS e esconde o endereço do servidor Ollama do navegador.

## Rodando Localmente

```bash
git clone https://github.com/kerlonr/Minerva.git
cd Minerva
npx vercel dev
```

Para usar o seu próprio servidor, troque o valor de `ollamaUrl` em `api/ollama.js` pelo endereço
do seu Ollama (por exemplo `http://localhost:11434`).

# Portfolio — Muhammad Anas Sajjad

Personal portfolio website for **Muhammad Anas Sajjad**, a Software Developer based in London.

## Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | 2 pages: landing + works listing |
| CSS3 | 3 stylesheets, CSS variables, 3D transforms, animations, responsive |
| PrismJS | Syntax highlighting for code windows |
| Python (livereload) | Dev server with hot-reload |
| Google Fonts | Roboto (variable) + Material Symbols Rounded |

## Pages

### Landing (`html/main.html`)
- Hero section with introduction
- 8 skill badges (Python, JavaScript, Java, C#, C++, React, HTML, CSS)
- 3D code windows with JavaScript examples
- GitHub + LinkedIn social links
- Featured work previews (3 projects) + "View All Works" link

### Works (`html/works.html`)
- 6 project cards with images, skill tags, and descriptions:
  - **SilentTalk** — End-to-end encrypted messaging (React, JS)
  - **Al Falah** — Islamic app with Quran, tasbih, hadith, prayer times (React Native, Expo, JS)
  - **Digital Logic Simulator** — Circuit simulator with custom gates and wires (HTML, CSS, JS)
  - **Javish Interpreter** — Java-like language interpreter in browser (HTML, CSS, JS)
  - **NEAT AI** — Neuroevolution of NN topologies (Java)
  - **Bus Router** — Optimal city bus routes via OpenStreetMap (Java)

## Dev Server

```bash
python3 server.py    # or ./serve.sh
```

Serves on `http://localhost:8000` with live-reload via the `livereload` package.

## Project Structure

```
portfolio/
├── css/          # global.css, main.css, works.css
├── html/         # main.html, works.html
├── img/          # screenshots + tech logos
├── js/           # (reserved)
├── libs/         # prism.js, prism-tomorrow.css
├── serve.sh
└── server.py
```

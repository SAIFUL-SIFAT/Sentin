# 🔒 Sentin — Privacy-First Browser Tools

<div align="center">
  <img src="src/app/icon.svg" width="80" height="80" alt="Sentin Logo" />
  <p><strong>A professional-grade, macOS-inspired productivity ecosystem that runs 100% locally.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Framework-Next.js-black?logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-blue?logo=tailwind-css)](https://tailwindcss.com/)
  [![GitHub stars](https://img.shields.io/github/stars/SAIFUL-SIFAT/Sentin.svg?style=social)](https://github.com/SAIFUL-SIFAT/Sentin/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/SAIFUL-SIFAT/Sentin.svg?style=social)](https://github.com/SAIFUL-SIFAT/Sentin/network/members)

  <p>Edit documents, process PDFs, convert media, and manage security tools — all in your browser sandbox with <b>zero data exfiltration</b>.</p>

  <a href="https://sentin.vercel.app"><strong>Explore the Demo »</strong></a>
  <br />
  <br />
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSAIFUL-SIFAT%2FSentin">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
</div>

---

## 🛡️ Privacy First, Always

Sentin is built on the absolute principle of **zero-upload processing**. 

- **100% Local Execution:** All computations, document parsing, and file modifications are performed securely inside your browser's sandbox using WebAssembly and client-side APIs.
- **Zero Data Exfiltration:** Your files, passwords, and tokens never leave your device. We do not use servers to process your data.
- **No Tracking:** No accounts, no cookies, no telemetry. Your workflow remains completely anonymous and private.
- **Offline Capable:** Once loaded, the tools function entirely without an internet connection.

## ✨ Tool Ecosystem

Sentin provides a beautifully designed interface housing a powerful suite of utilities:

### 📝 Documents
- **Word Editor:** Advanced rich text editing with `.docx` import/export, powered by `Tiptap`.
- **Markdown Editor:** Professional markdown environment with real-time preview and GFM support.

### 📄 PDF Suite
- **Merge & Split:** Combine documents or extract pages locally using `pdf-lib`.
- **Reorder Pages:** Visually reorganize PDF pages with drag-and-drop.
- **Image to PDF:** Convert scans and photos into professional PDF documents.

### 🖼️ Media
- **Image Compressor:** Lossless optimization utilizing local Canvas API processing.
- **Format Converter:** Cross-convert between JPEG, PNG, and WebP instantly.
- **QR Generator:** Create secure, customizable QR codes offline.

### 🔐 Security
- **Password Generator:** Cryptographically strong password generation.
- **Hash Tools:** Generate and analyze MD5/SHA hashes locally.
- **JWT Decoder:** Inspect JSON Web Tokens without exposing sensitive claims.

## 🚀 Getting Started

Sentin is built with **Next.js 15**, **React 19**, and **Tailwind CSS**.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SAIFUL-SIFAT/Sentin.git
   cd Sentin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🏗️ Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Glassmorphism design system)
- **Animations:** Framer Motion
- **Core Libs:** pdf-lib, docx, mammoth, tiptap, codemirror

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ for privacy. Star this repo if you find it useful!
</div>

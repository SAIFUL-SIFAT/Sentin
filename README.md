# Sentin

<div align="center">
  <p><strong>A professional-grade, privacy-first tool ecosystem.</strong></p>
  <p>Edit documents, process PDFs, and manage data — all locally in your browser with zero data exfiltration.</p>
</div>

---

## 🛡️ Privacy First, Always

Sentin is built on the absolute principle of **zero-upload processing**. 

- **100% Local Execution:** All computations, document parsing, and file modifications are performed securely inside your browser's sandbox.
- **Zero Data Exfiltration:** Your files, passwords, and tokens never leave your device. We do not use servers to process your data.
- **No Tracking:** No accounts, no cookies, no telemetry. Your workflow remains completely anonymous and private.

## ✨ Core Ecosystem

Sentin provides a beautifully designed, macOS-inspired interface housing a powerful suite of developer and productivity tools.

### 📝 Documents
- **Word Editor:** Advanced rich text editing with `.docx` import/export capabilities, completely offline.
- **Markdown Editor:** Professional markdown environment with real-time preview and export.

### 📄 PDF Suite
- **Viewer & Nav:** Securely view and navigate sensitive PDF documents.
- **Merge & Split:** Combine multiple documents or slice pages without uploading them to sketchy third-party sites.
- **Reorder Pages:** Visually drag and drop PDF pages to reorganize documents.
- **Image to PDF:** Convert physical scans and images to compiled PDF documents.

### 🖼️ Media
- **Image Compressor:** Privacy-first image optimization utilizing local Canvas API processing.
- **Format Converter:** Instantly cross-convert images between JPEG, PNG, and WebP.
- **Image Resizer:** Pixel-perfect image scaling with aspect ratio locking.
- **QR Generator:** Create secure, customizable QR codes offline.

### 🔐 Security
- **Password Generator:** Generate cryptographically strong, secure passwords locally.
- **Hash Generator & Analyzer:** Generate and identify hash types (MD5, SHA-256) and audit their security strength.
- **JWT Decoder:** Deeply inspect JSON Web Tokens locally to verify claims and headers.

### 💻 Developer
- **Code Editor:** Advanced code editor with syntax highlighting for various languages.
- **JSON Formatter:** Format, validate, and parse JSON structures locally.
- **Diff Checker:** Compare text and code revisions securely without uploading proprietary code.

## 🚀 Getting Started

Sentin is built with **Next.js**, **React**, and **Tailwind CSS**. 

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

4. **Launch the ecosystem:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to start using Sentin.

## 🏗️ Architecture & Technologies

Sentin is engineered for performance and aesthetics, utilizing a modern tech stack:

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Dark Glassmorphism & Editorial Aesthetic)
- **Animations:** Framer Motion
- **Editors:** Tiptap (Rich Text), CodeMirror (Code), UIW (Markdown)
- **PDF Processing:** `pdf-lib`
- **Document Processing:** `docx`, `mammoth`

## 📁 Project Structure

```text
sentin/
├── src/
│   ├── app/                 # Next.js App Router (Layouts & Pages)
│   ├── components/          # React Components
│   │   ├── developer/       # Code editors and developer utilities
│   │   ├── documents/       # Word & Markdown editors
│   │   ├── media/           # Image processors & QR tools
│   │   ├── pdf/             # PDF manipulation suite
│   │   ├── security/        # Cryptography & security tools
│   │   └── ui/              # Reusable Shadcn UI & macOS dock
│   ├── lib/                 # Utility functions
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
└── package.json             # Dependencies & Scripts
```

## 📜 License

This project is open-source and available under the MIT License.

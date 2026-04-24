# Sentin

A professional-grade, privacy-first tool ecosystem designed for local, browser-based document and data processing.

## Core Features
- **Documents**: Word Editor (.docx) and Markdown Editor.
- **PDF Suite**: Merge, Split, View, and Image-to-PDF conversion.
- **Media**: Image Compression and QR Generation.
- **Security**: Secure Password Generation and File Hashing (SHA-256/512).
- **Developer**: JSON Formatting, Code Editing, and Diff Checking.

## Privacy First
Sentin is built on the principle of zero-upload processing. 
- All computations are performed locally in your browser.
- Your files never leave your device.
- No accounts, no tracking, no cookies.

## Getting Started
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run locally**:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Project Structure
```text
sentin/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── JSONFormatter.tsx
│   │   ├── QRCodeGen.tsx
│   │   ├── PDFSplit.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── DiffChecker.tsx
│   │   ├── ImageToPDF.tsx
│   │   ├── PasswordGen.tsx
│   │   ├── PDFMerge.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── WordEditor.tsx
│   │   ├── ImageCompressor.tsx
│   │   ├── HashGenerator.tsx
│   │   └── CodeEditor.tsx
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── README.md
```

## Built With
- React & Vite
- Tailwind CSS (Brutalist/Editorial Aesthetic)
- Lucide React
- Framer Motion
- Tiptap / CodeMirror

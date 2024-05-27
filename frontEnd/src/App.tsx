/* eslint-disable @typescript-eslint/no-unused-vars */
import { SVGProps, useRef } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";

function App() {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(
    editor: monacoEditor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
  }

  function showValue() {
    if (editorRef.current) {
      alert(editorRef.current.getValue());
    }
  }
  return (
    <div className="flex h-screen w-full flex-col bg-gray-950 text-gray-50">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <CodeIcon className="h-6 w-6" />
          <span className="text-xl font-semibold">Code Playground</span>
        </div>
        <Button onClick={showValue}>Run</Button>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 gap-6 p-4 sm:grid-cols-[1fr_400px] sm:p-6">
          <div className="flex h-full flex-col gap-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <span className="text-sm font-medium">Code Editor</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <MaximizeIcon className="h-5 w-5" />
                  <span className="sr-only">Maximize</span>
                </Button>
                <Button size="icon" variant="ghost">
                  <MinimizeIcon className="h-5 w-5" />
                  <span className="sr-only">Minimize</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Editor
                defaultLanguage="python"
                theme="vs-dark"
                defaultValue="print('Hello, world!')"
                onMount={handleEditorDidMount}
                options={{}}
              />
            </div>
          </div>
          <div className="flex h-full flex-col gap-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <span className="text-sm font-medium">Output</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <MaximizeIcon className="h-5 w-5" />
                  <span className="sr-only">Maximize</span>
                </Button>
                <Button size="icon" variant="ghost">
                  <MinimizeIcon className="h-5 w-5" />
                  <span className="sr-only">Minimize</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {" "}
              {/* Added padding for better visibility */}
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                Hello, world!
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

function CodeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function MaximizeIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function MinimizeIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

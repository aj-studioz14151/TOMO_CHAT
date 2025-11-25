import { JSONSchema7 } from "json-schema";
import { tool as createTool } from "ai";
import { jsonSchemaToZod } from "lib/json-schema-to-zod";

const htmlDescription = `Complete HTML code including <!DOCTYPE html>, <html>, <head>, and <body> tags. 
The HTML will be rendered in a live preview with full CSS and JavaScript support.

You can include:
- Inline CSS in <style> tags or style attributes
- JavaScript in <script> tags for interactivity
- Modern HTML5 elements and features
- External CDN resources (fonts, libraries, etc.)

Example:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a live preview.</p>
  </div>
</body>
</html>`;

export const htmlPreviewSchema: JSONSchema7 = {
  type: "object",
  properties: {
    html: {
      type: "string",
      description: htmlDescription,
    },
    title: {
      type: "string",
      description: "Optional title for the preview (shown in the UI)",
    },
  },
  required: ["html"],
};

export const htmlPreviewTool = createTool({
  description: `Create and display HTML pages with live preview. Use this when users request HTML pages, web designs, interactive demos, or visual components. The HTML will be rendered in an iframe with full CSS and JavaScript support, allowing users to see and interact with the result immediately.`,
  inputSchema: jsonSchemaToZod(htmlPreviewSchema),
});

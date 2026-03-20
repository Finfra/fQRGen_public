# Workflow: fQRGen API Interaction

## Goal
To successfully communicate with the running fQRGen application, verify its status, and generate a QR code using the REST API.

## Steps
1. **Check Server Health**:
   - Run `curl -s http://localhost:3014/` to ensure the server is responding.
   - If it returns an error or connection refused, inform the user that the fQRGen app or its API server needs to be running.
2. **Prepare Request**:
   - Determine the target URL/text, desired format (PNG/SVG), and scale from the user's prompt.
3. **Generate QR Code**:
   - Apply the `generate-qr` skill.
   - Execute the appropriate `curl` POST request to `/api/generate`.
4. **Verify Result**:
   - Check if the output file was created and is not empty.
   - Notify the user of the successful generation and the file location.
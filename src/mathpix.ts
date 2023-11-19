export async function mathpixImageToText(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("options_json", '{"math_inline_delimiters": ["$", "$"], "rm_spaces": true}');

  const req = await fetch("https://api.mathpix.com/v3/text", {
    method: "POST",
    headers: {
      app_id: "andriisuslenko_686682_e104df",
      app_key: "37baa4ce0f9d8df367b97e5d8e96cf6a3514bfa95e58a6c625df336c609f437c",
    },
    body: formData,
  });
  const data = await req.json();
  return data;
}

import uuid
from pyodk.client import Client
from pathlib import Path

def log(*args):
  print("[test.py]", *args)

log("Welcome")

log("Initialising pyodk client...")
with Client(config_path="pyodk.conf.toml") as client:
  log("TODO Attempting to create project...")

  log("TODO Attempting to upload form...")

  log("Attempting to upload submission...")
  file = Path(__file__).parent / "fruits.csv"
  submissionId = f'uuid:{uuid.uuid4()}'

  log("Uploading submission with:")
  log("  submission ID:", submissionId)
  log("  attachment:", file.name)

  submission = client.submissions.create(
    xml = (
      f'<data id="upload_file" version="1">'
      f'  <meta><instanceID>{submissionId}</instanceID></meta>'
      f'  <name>file</name>'
      f'  <file>{file.name}</file>'
      f'</data>'
    ),
    form_id = "upload_file",
    attachments = [file],
  )
  attachment = submission.attachments[0]
  assert attachment.exists, "Attachment failed to upload"

  res = client.get(f'projects/1/forms/upload_file/submissions/{submissionId}/attachments/{file.name}')
  assert res.status_code == 200, f'Unexpected status code: {res.status_code}'

  assert res.headers["content-type"] == "text/csv", f'Unexpected Content-Type header: {res.headers["content-type"]}'

log("Completed OK.")

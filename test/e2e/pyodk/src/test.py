import uuid
from pyodk.client import Client
from pathlib import Path

def log(*args):
  print("[test.py]", *args)

log("Welcome")

log("Initialising pyodk client...")
with Client(config_path="pyodk.conf.toml") as client:
  log('Creating project...')
  res = client.post("projects", data='{"name":"test project 1"}', headers={'content-type': 'application/json'})
  # Allow successful creation, or 409 (project already exists)
  assert res.status_code == 200 or res.status_code == 409, f'Failed to create project.  HTTP response code: {res.status_code}'

  log("Uploading form...")
  try:
    client.forms.create(
      definition = (
        f'<?xml version="1.0"?>'
        f'<h:html xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:jr="http://openrosa.org/javarosa" xmlns:orx="http://openrosa.org/xforms" xmlns:odk="http://www.opendatakit.org/xforms">'
        f'  <h:head>'
        f'    <h:title>upload_file</h:title>'
        f'    <model odk:xforms-version="1.0.0">'
        f'      <instance>'
        f'        <data id="upload_file" version="1">'
        f'          <name/>'
        f'          <file/>'
        f'          <meta>'
        f'            <instanceID/>'
        f'          </meta>'
        f'        </data>'
        f'      </instance>'
        f'      <bind nodeset="/data/name" type="string"/>'
        f'      <bind nodeset="/data/file" type="binary"/>'
        f'      <bind nodeset="/data/meta/instanceID" type="string" readonly="true()" jr:preload="uid"/>'
        f'    </model>'
        f'  </h:head>'
        f'  <h:body>'
        f'    <input ref="/data/name">'
        f'      <label>Name</label>'
        f'    </input>'
        f'    <upload mediatype="application/*" ref="/data/file">'
        f'      <label>File</label>'
        f'    </upload>'
        f'  </h:body>'
        f'</h:html>'
      ),
    )
  except ODKClientError as err:
    assert err.status_code == 409, f'Failed to create form.  HTTP response code: {res.status_code}'

  file = Path(__file__).parent / "fruits.csv"
  submissionId = f'uuid:{uuid.uuid4()}'

  log('Uploading submission with:')
  log('  submission ID:', submissionId)
  log('  attachment:', file.name)

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

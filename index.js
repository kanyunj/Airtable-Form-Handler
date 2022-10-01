addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))

})

const FORM_URL = "https://airtable-form-example.pages.dev"

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === "/submit") {
    return submitHandler(request)
  }
  return Response.redirect(FORM_URL)
}

const submitHandler = async request => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405
    })
  }
  const body = await request.formData();
  const {
    first_name,
    last_name,
    email,
    phone,
    subject,
    message
  } = Object.fromEntries(body)

  // The keys in "fields" are case-sensitive, and should exactly match the field names you set up in your Airtable table, such as "First Name".

  const reqBody = {
    fields: {
      "First Name": first_name,
      "Last Name": last_name,
      "Email": email,
      "Phone Number": phone,
      "Subject": subject,
      "Message": message
    }
  }
  await createAirtableRecord(reqBody)
  return Response.redirect(FORM_URL)

}

const createAirtableRecord = body => {
  try {
    return fetch(`https://api.airtable.com/v0/${appsJIHjbZQXuKqlH}/${encodeURIComponent(tbl7cR6YrR42aID2t)}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-type': `application/json`
      }
    })
  } catch {
    return new Response(`Error airtable error ${err}`, { status: 400 });
  }

}



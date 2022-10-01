addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))

})

const FORM_URL = "https://airtable-form-handler.kanyan.workers.dev"

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === "/submit") {
    return submitHandler(request)
  }

  // return Response.redirect(FORM_URL)
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

  // The keys in "fields" are case-sensitive, and  // should exactly match the field names you set up  // in your Airtable table, such as "First Name".
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

  // await createAirtableRecord(reqBody)
  // return Response.redirect(FORM_URL)
  // const output = await createAirtableRecord(reqBody);
  try {
    const output = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-type': `application/json`
      }
    }).then(response => response.json())
    
    let pretty = JSON.stringify([...body], null, 2);

    return new Response(pretty, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

  }catch(err) {
    return new Response(`Error airtable error ${err}`, { status: 400 });
  }
 

}

const createAirtableRecord = body => {
  try {
    return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-type': `application/json`
      }
    }).then(response => response.json())
  }catch(err) {
    return new Response(`Error airtable error ${err}`, { status: 400 });
  }
}

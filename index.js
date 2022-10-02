addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))

})

const FORM_URL = "https://test-form123.pages.dev"

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === "/submit2") {
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
  // return Response.redirect(FORM_URL)
  sendEmail(request);

}

const createAirtableRecord = body => {
  return fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-type': `application/json`
    }
  })
}


//----------------------------
// Sending email
//----------------------------
async function sendEmail(request) {
  let content = "";
  for( var i of request.headers.entries() ) {
      content += i[0] + ": " + i[1] + "\n";
  }
  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
      "method": "POST",
      "headers": {
          "content-type": "application/json",
      },
      "body": JSON.stringify({
          "personalizations": [
              { "to": [ {"email": "kanyunj@gmail.com",
                      "name": "Jennifer Kanyunyuzi"}]}
          ],
          "from": {
              "email": "jckanyan22@gmail.com",
              "name": "Jenny Kanyan",
          },
          "subject": "Test Subject1",
          "content": [{
              "type": "text/plain",
              "value": "Test message content\n\n" + content,
          }],
      }),
  });

  let respContent = "";
  // only send the mail on "POST", to avoid spiders, etc.
  if( request.method == "POST" ) {
      const resp = await fetch(send_request);
      const respText = await resp.text();

      respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

  }

  let htmlContent = "<html><head></head><body><pre>" +
      "</pre><p>Click to send message: <form method='post'><input type='submit' value='Send'/></form></p>" +
      "<pre>" + respContent + "</pre>" +
      "</body></html>";
  return new Response(htmlContent, {
      headers: { "content-type": "text/html" },
  })
}
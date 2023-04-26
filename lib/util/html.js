// handy dev function for enabling syntax hilighting of html
const html = ([ first, ...rest ], ...vars) => first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');

// Style to look like odk-central-frontend
const frontendPage = ({ head='', body }) => html`
  <html>
    <head>
      ${head}
      <style>
        body { margin:0; font-family:"Helvetica Neue", Helvetica, Arial, sans-serif; background-color:#f7f7f7; }
        .header { background-color:#bd006b; color:white; box-shadow: 0 3px 0 #dedede; border-top: 3px solid #8d0050; padding:0.5em 0; }
        .header a,.header a:active,.header a:visited { margin:1em; font-size:12px; font-weight:700; color:white; text-decoration:none; }
        #content { margin:3em auto; width:80%; background-color:white; border-color:rgb(51, 51, 51); box-shadow:rgba(0, 0, 0, 0.25) 0px 0px 24px 0px, rgba(0, 0, 0, 0.28) 0px 35px 115px 0px; }
        #content h1 { background-color:#bd006b; color:white; border-bottom:1px solid #ddd; padding:10px 15px; font-size:18px; margin:0; }
        #content div { border-bottom:1px solid #ddd; padding:10px 15px; }
        #content div:last-child { border-bottom:none; background-color:#eee; }
        #content div:last-child a { background-color:#009ecc; color:white; display:inline-block; padding:6px 10px 5px; border-radius:2px; text-decoration:none; font-size:12px; border-color:#286090; }
        #content div:last-child a:hover { background-color:#0086ad; border-color:#204d74; }
        #content pre { white-space:pre-wrap; }
      </style>
    </head>
    <body>
      <div class="header"><a href="/">ODK Central</a></div>
      <div id="content">
        ${body}
      </div>
    </body>
  </html>
`;

module.exports = { frontendPage, html };

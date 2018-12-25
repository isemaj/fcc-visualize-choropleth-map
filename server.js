let express = require("express");
let app = express();

app.use(express.static("public"));

app.get("/", function(request, response){
  response.sendFile(__dirname + "/public/index.html");
});

app.listen(process.env.PORT);

//https://socket.io/docs/v4/server-initialization/
const express = require("express");
const Contenedor = require('./contenedor');
const { createNProducts } = require("./faker");
const { normalizeMessages } = require("./normalizr");
const contenedor = new Contenedor('./products.txt')
const mensajes = new Contenedor('./mensajes.txt')

const app = express();

//IMPLEMENTACION
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);

httpServer.listen(8080, () => console.log("SERVER ON http://localhost:" + 8080));

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile( __dirname + "/index.html" );
});

app.get("/api/productos-test", (req, res) =>{
  let randomProducts = [];
  createNProducts(randomProducts, 5);
  res.render("productosFaker.pug", {title: "Productos random", products: randomProducts, productsExist: true})
})


io.on("connection", (socket) => {
  //atajo los mensajes
  socket.on("msg", async (data)=>{
    mensajes.save(data);
    const allMsgs = await mensajes.getAll();
    const chatNormalizado = normalizeMessages(allMsgs);
    io.sockets.emit("msg-list", chatNormalizado);
  })

  socket.on("product", (data)=>{
    contenedor.save(data);
    const listProducts = contenedor.getAll();
    io.sockets.emit("product-list", listProducts);
  })

})





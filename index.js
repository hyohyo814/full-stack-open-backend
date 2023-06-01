const express = require("express");
const morgan = require("morgan");
const app = express();


app.use(express.json());

//app.use(morgan('tiny', {skip: (req) => req.statusCode < 400}))


app.use(morgan(
    ":method :url :status :res[content-length] - :response-time ms :logger",
    {skip: (req, res) => res.statusCode === 400 || req.statusCode === 204}
));


let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send("<h1>persons</h1>");
  morgan.token("logger", (req, res) => {
    return
  });
});

app.get("/info", (req, res) => {
  const count = [...persons].length;
  const date = Date();
  console.log(count);
  console.log(date);
  res.send(
    `<p>Phonebook has info for ${count} people</p>
        <p>${date}</p>`
  );
  morgan.token("logger", (req, res) => {
    return
  });
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
  morgan.token("logger", (req, res) => {
    return;
  });
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((p) => p.id === id);

  person ? res.json(person) : res.status(404).end();
});

const genId = () => {
  const id = Math.floor(Math.random() * 99999);
  return id;
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  const names = persons.map((p) => p.name);
  //console.log(names);

  if (!body.name) {
    return res.status(400).json({ error: "name missing" });
  }

  if (!body.number) {
    return res.status(400).json({ error: "number missing" });
  }

  const check = names.find((n) => n.toLowerCase() === body.name.toLowerCase());
  //console.log(check);
  if (check !== undefined) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = {
    id: genId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  res.json(persons);
  
  morgan.token("logger", (req, res) => {
    return JSON.stringify(req.body);
  });

});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((p) => p.id !== id);

  res.status(204).end();

  morgan.token("logger", (req, res) => {
    return JSON.stringify(req.body);
  });
});



const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);

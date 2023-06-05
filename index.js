const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const Person = require("./models/person");

morgan.token("logger", (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :logger :res[content-length] - :response-time ms",
    { skip: (req, res) => res.statusCode === 400 || req.statusCode === 204 }
  )
);

app.get("/", (req, res, next) => {
  res.send("<h1>persons</h1>");
});

app.get("/info", (req, res, next) => {
  Person.count({})
    .then((count) => {
      const date = Date();
      res.send(
        `<p>Phonebook has info for ${count} people</p>
          <p>${date}</p>`
      );
    })
    .catch((err) => next(err));
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((persons) => {
      res.json(persons);
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  //console.log(names);

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((newPerson) => {
      res.json(newPerson);
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((deleted) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query'})
    .then((updatedContact) => {
      res.json(updatedContact);
    })
    .catch((err) => next(err));
});

const errorHandler = (err, req, res, next) => {
  console.log(err.message);

  if (err.name === "CastError") {
    return res.status(404).send({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message })
  }
  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

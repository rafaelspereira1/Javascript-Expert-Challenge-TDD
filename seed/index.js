import { faker } from "@faker-js/faker";
import { writeFile } from "fs/promises";
import fs from "fs";
import { join } from "path";
import Car from "./../src/entities/car.js";
import CarCategory from "./../src/entities/carCategory.js";
import Customer from "./../src/entities/customer.js";

if (!fs.existsSync("./database")) {
  fs.mkdirSync("./database");
}

const seeederBaseFolder = new URL("../database", import.meta.url).pathname;

const ITEMS_AMOUNT = 2;

const carCategory = new CarCategory({
  id: faker.datatype.uuid(),
  name: faker.vehicle.type(),
  carIds: [],
  price: faker.finance.amount(20, 100),
});

const cars = [];
const customers = [];

for (let index = 0; index < ITEMS_AMOUNT; index++) {
  const car = new Car({
    id: faker.datatype.uuid(),
    name: faker.vehicle.model(),
    available: true,
    gasAvailable: true,
    releaseYear: faker.date.past().getFullYear(),
  });

  carCategory.carIds.push(car.id);
  cars.push(car);

  const customer = new Customer({
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    age: faker.datatype.number({ min: 18, max: 50 }),
  });

  customers.push(customer);
}

const write = (filename, data) =>
  writeFile(join(seeederBaseFolder, filename), JSON.stringify(data));

(async () => {
  await write("cars.json", cars);
  await write("carCategories.json", [carCategory]);
  await write("customers.json", [customers]);

  console.log(cars);
  console.log(carCategory);
  console.log(customers);
})();

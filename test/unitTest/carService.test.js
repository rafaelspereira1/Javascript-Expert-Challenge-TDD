import { describe, it, before, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";

import validCarCategory from "./../mocks/valid-carCategory.json" assert { type: "json" };
import validCar from "./../mocks/valid-car.json" assert { type: "json" };
import validCustomer from "./../mocks/valid-customer.json" assert { type: "json" };

import CarService from "./../../src/service/carService.js";

import Transaction from "../../src/entities/transaction.js";

const carDatabase = new URL("./../../database/cars.json", import.meta.url)
  .pathname;

const mocks = {
  validCarCategory,
  validCar,
  validCustomer,
};

describe("CarService Suite Tests", () => {
  let carService = {};
  let sandbox = {};

  before(() => {
    carService = new CarService({
      cars: carDatabase,
    });
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should retrieve a random position from an array", () => {
    const data = [0, 1, 2, 3, 4];
    const result = carService.getRandomPositionFromArray(data);

    expect(result).to.be.lte(data.length).and.be.gte(0);
  });
  it("Should choose the first id from carIds in carCategory", () => {
    const carCategory = mocks.validCarCategory;
    const carIdIndex = 0;

    sandbox
      .stub(carService, carService.getRandomPositionFromArray.name)
      .returns(carIdIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIdIndex];

    expect(result).to.be.equal(expected);

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
  });
  it("given a carCategory it should be available", async () => {
    const car = mocks.validCar;
    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.carIds = [car.id];

    sandbox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    sandbox.spy(carService, carService.chooseRandomCar.name);

    const result = await carService.getAvailableCar(carCategory);
    const expected = car;

    expect(result).to.be.deep.equal(expected);
    expect(carService.chooseRandomCar.calledOnce).to.be.ok;

    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
  });
  it("given a carCategory, customer and numberOfDays it should calculate final amount in real", async () => {
    const customer = Object.create(mocks.validCustomer);
    customer.age = 50;

    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.price = 37.6;

    const numberOfDays = 5;

    const expected = carService.currencyFormat.format(244.4);
    const result = carService.calculateFinalPrice(
      customer,
      carCategory,
      numberOfDays
    );

    expect(result).to.be.deep.equal(expected);
  });
  it("given a customer and car category it should return a transaction receipt", async () => {
    const car = mocks.validCar;

    const carCategory = {
      ...mocks.validCarCategory,
      price: 37.6,
      carIds: [car.id],
    };

    const customer = Object.create(mocks.validCustomer);
    customer.age = 20;

    const numberOfDays = 5;
    const dueDate = "10 de novembro de 2020";

    const now = new Date(2020, 10, 5);
    sandbox.useFakeTimers(now.getTime());

    sandbox
      .stub(carService.carRepository, carService.carRepository.find.name)
      .resolves(car);

    const expectedAmount = carService.currencyFormat.format(206.8);
    const result = await carService.rent(customer, carCategory, numberOfDays);
    const expected = new Transaction({
      customer,
      car,
      dueDate,
      amount: expectedAmount,
    });

    expect(result).to.be.deep.equal(expected);
  });
});

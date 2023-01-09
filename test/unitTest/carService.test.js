import { describe, it, before, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";

import validCarCategory from "./../mocks/valid-carCategory.json" assert { type: "json" };
import validCar from "./../mocks/valid-car.json" assert { type: "json" };
import validCustomer from "./../mocks/valid-customer.json" assert { type: "json" };

import CarService from "./../../src/service/carService.js";

const carDatabase = new URL("./../../database/cars.json", import.meta.url)
  .pathname;

const mocks = {
  validCarCategory,
  validCar,
  validCustomer,
};

describe("CarService Suite Test", () => {
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

  it("should choose the first id from CardIds in carCategory", () => {
    const carCategory = mocks.validCarCategory;
    const carIdIndex = 0;

    sandbox
      .stub(carService, carService.getRandomPositionFromArray.name)
      .returns(carIdIndex);

    const result = carService.chooseRandomCar(carCategory);
    const expected = carCategory.carIds[carIdIndex];

    expect(carService.getRandomPositionFromArray.calledOnce).to.be.ok;
    expect(result).to.be.equal(expected);
  });

  it("given a carCategory it shouild return an available car", async () => {
    const car = mocks.validCar;
    const carCategory = Object.create(mocks.validCarCategory);

    carCategory.carIds = [car.id];

    sandbox
      .stub(
        carService.carRepository, //
        carService.carRepository.find.name
      )
      .resolves(car);

    sandbox.spy(
      carService, //
      carService.chooseRandomCar.name
    );

    const result = await carService.getAvailableCar(carCategory);
    const expected = car;

    expect(carService.chooseRandomCar.calledOnce).to.be.ok;
    expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
    expect(result).to.be.deep.equal(expected);
  });

  it("given a carCategory, costumer and numberOfDays it should calculate final ammount in real", async () => {
    const costumer = Object.create(mocks.validCustomer);
    costumer.age = 50;

    const carCategory = Object.create(mocks.validCarCategory);
    carCategory.price = 37.6;

    const numberOfDays = 5;

    sandbox
      .stub(carService, "taxesBasedOnAge")
      .get(() => [{ from: 40, to: 50, then: 1.3 }]);

    const expected = carService.currencyFormat.format(244.4);
    const result = carService.calculateFinalPrice(
      carCategory,
      costumer,
      numberOfDays
    );

    expect(result).to.be.deep.equal(expected);
  });
});

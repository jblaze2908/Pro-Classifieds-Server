const cities = require("../utilities/cities");
const userHandler = {
  cityByState: async (req, res) => {
    try {
      let state = req.params.state;
      let citiesByState = await getCities(state);
      return res.status(200).json({ citiesByState });
    } catch (e) {
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
};
const getCities = (state) => {
  return new Promise(async (resolve, reject) => {
    let citiesByState = [];
    for (const city of cities) {
      if (city.State.toLowerCase() === state.toLowerCase()) {
        citiesByState.push({
          label: city.City,
          value: city.City.toLowerCase(),
        });
      }
    }
    resolve(citiesByState);
  });
};
module.exports = userHandler;

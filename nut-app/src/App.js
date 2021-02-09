import React from "react";
import Select from 'react-select'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink
} from "react-router-dom";

import {
  GoogleLogin,
  GoogleLogout
} from "react-google-login";
import { Radar } from '@reactchartjs/react-chart.js'

import './App.css';
import './img/foodie.jpeg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';

const clientId = '215014189062-v4hpu170d8rl49ga1cgta4p2kbpoprvv.apps.googleusercontent.com';
let userName = "New User";

function stringifyDate(date) {
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0');
  let yyyy = date.getFullYear();
  return yyyy + '-' + mm + '-' + dd;
}


let savedMeals = [];
if (mealExists("__mealList__")) {
  savedMeals = getMeal("__mealList__");
}

let mealStoreName = "MY_MEALS_IUHGOIUGOUYTGUOIYG_";
let mealKeysName = "ALL_MY_MEALS_GUIFIUYHGFUIYGU";

// Meal Manager

// Save a new meal under a given day
function saveMealEaten(foods, time, date) {
  let storeName = mealStoreName + date;
  let oldDay = getMealsEaten(date);

  let newMealEaten = {
    foods: foods,
    time: time,
    date: date,
    calories: 0,
    fat: 0,
    protein: 0,
    sodium: 0
  };

  for (let i in foods) {
    let food = getMeal(foods[i]);
    newMealEaten.calories += food.totalNut[0];
    newMealEaten.fat += food.totalNut[1];
    newMealEaten.protein += food.totalNut[2];
    newMealEaten.sodium += food.totalNut[3];
  }

  oldDay.push(newMealEaten);
  localStorage.setItem(storeName, JSON.stringify(oldDay));

  // Append master list of daily keys
  let mealKeys = [];
  if (localStorage.getItem(mealKeysName) !== null)
    mealKeys = JSON.parse(localStorage.getItem(mealKeysName));
  if (!mealKeys.includes(date))
    mealKeys.push(date);
  localStorage.setItem(mealKeysName, JSON.stringify(mealKeys));
}

// Get meals
function getMealsEaten(date) {
  let storeName = mealStoreName + date;
  if (localStorage.getItem(storeName) === null)
    return [];
  else
    return JSON.parse(localStorage.getItem(storeName));
}

let calData = [];
// Update data on calender
function populateCalender() {
  calData = [];

  let mealKeys = [];
  if (localStorage.getItem(mealKeysName) !== null)
    mealKeys = JSON.parse(localStorage.getItem(mealKeysName));

  for (let i in mealKeys) {
    let mealsToday = getMealsEaten(mealKeys[i]);

    let ate = ["", "", "", ""];
    let day = mealsToday[0].date;
    let cal = 0;
    let fat = 0;
    let pro = 0;
    let sod = 0;

    for (let x in mealsToday) {
      let mealToday = mealsToday[x];

      cal += mealToday.calories;
      fat += mealToday.sodium;
      pro += mealToday.fat;
      sod += mealToday.protein;

      for (let y in mealToday.foods) {
        if (mealToday.time === "Breakfast")
          ate[0] += mealToday.foods[y] + ", ";
        else if (mealToday.time === "Lunch")
          ate[1] += mealToday.foods[y] + ", ";
        else if (mealToday.time === "Dinner")
          ate[2] += mealToday.foods[y] + ", ";
        else
          ate[3] += mealToday.foods[y] + ", ";
      }
    }
    // Populate day
    if (ate[0] !== "")
      calData.push({ title: '1. Breakfast: ' + ate[0].slice(0, -2), date: day, color: "orange" });
    if (ate[1] !== "")
      calData.push({ title: '2. Lunch: ' + ate[1].slice(0, -2), date: day, color: "green" });
    if (ate[2] !== "")
      calData.push({ title: '3. Dinner: ' + ate[2].slice(0, -2), date: day, color: "blue" });
    if (ate[3] !== "")
      calData.push({ title: '4. Snack: ' + ate[3].slice(0, -2), date: day, color: "grey" });

    calData.push({ title: 'Calories: ' + Math.round(cal) + ' KCAL', date: day });
    calData.push({ title: 'Protein: ' + Math.round(pro) + ' G', date: day });
    calData.push({ title: 'Sodium: ' + Math.round(sod) + ' MG', date: day });
    calData.push({ title: 'Fat: ' + Math.round(fat) + ' G', date: day });
  }
}


export default function BasicExample() {
  return (
    <Router>
      <section id="page">

        <header>
          <div className="siteName">🍎Nutrition Site</div>
          <div className="accountBar"><AuthenticationClass /></div>
        </header>
        <nav id="nav">
          <NavLink to="/home" className="homeBg" activeClassName="navbar__link--active"><p className="navTitle">Home</p></NavLink>
          <NavLink to="/ingredients" className="ingredientsBg" activeClassName="navbar__link--active"><p className="navTitle">Ingredients</p></NavLink>
          <NavLink to="/meals" className="mealsBg" activeClassName="navbar__link--active"> <p className="navTitle">Create Meals</p></NavLink>
          <NavLink to="/addmeal" className="dashboardBg" activeClassName="navbar__link--active"> <p className="navTitle">Add Meals</p></NavLink>
          <NavLink to="/calendar" className="tabBg" activeClassName="navbar__link--active"> <p className="navTitle">Calendar</p></NavLink>
          <div id="navPane">
            Created by: {"\n"} Ashot{'\u00A0'}Chobanyan,{"\n"} Gregory Chen, {"\n"}Ronald Reyes
          </div>
        </nav>

        <main>
          <Switch>
            <Route exact path="/home">
              <Home />
            </Route>
            <Route path="/ingredients">
              <Ingredients />
            </Route>
            <Route path="/meals">
              <Meals />
            </Route>
            <Route path="/addmeal">
              <Dashboard />
            </Route>
            <Route path="/calendar">
              <Calendar />
            </Route>
          </Switch>
        </main>
        <footer>
          <br></br>
          This is a school project, do NOT take any nutritional advice from this app.
        </footer>
      </section>
    </Router>
  );
}

function standardizeUnit(value, unit) {
  let val = value;
  let u = unit;
  if (unit === "kJ") {
    val *= 0.239006;
    u = "KCAL";
  }

  return [val, u];
}

function printStandardizedUnit(value, unit) {
  let arr = standardizeUnit(value, unit);
  return Math.round(arr[0]) + " " + arr[1];
}


let detectInput = "";

// Browser ingredients in detail
class IngredientPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      selectedIngredientId: -1,
      selectedIngredient: "",
      foods: [],
      isLoaded: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    clearTimeout(detectInput);
    this.setState({ value: event.target.value });
    detectInput = setTimeout(() => {
      console.log("Input!");
    }, 2000);
  }

  handleSubmit(event) {
    event.preventDefault();
    fetch("https://api.nal.usda.gov/fdc/v1/foods/search?api_key=****" + encodeURIComponent(this.state.value))
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            apiReturn: result,
            foods: result.foods
          });
          console.log(this.state.apiReturn.foods);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  handleClick = value => () => {
    this.setState({ selectedIngredientId: value });
    fetch("https://api.nal.usda.gov/fdc/v1/food/" + encodeURIComponent(value) + "?api_key=****")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            selectedIngredient: result
          });
          console.log(result);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  };

  render() {
    /*
    let hasExtraIngredients = false;
    if (this.state.selectedIngredient.ingredients) {
      hasExtraIngredients = true;
    }
    */

    let nutrientsOfInterest = ["Energy", "Protein", "Sodium, Na", "Total lipid (fat)"];
    let nutrientDisplayName = ["Calories", "Protein", "Sodium", "Fat"];
    let defaultDisplay = [];
    let numNut = nutrientsOfInterest.length;
    for (var i = 0; i < numNut; i++) {
      defaultDisplay.push("-");
    }

    let hiddenBeforeLoad = "hidden";
    let hiddenOnLoad = "";
    if (this.state.isLoaded === true) {
      hiddenBeforeLoad = "";
      hiddenOnLoad = "hiddenOnLoad"
    }

    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              Search for <input className="roundedEntry" type="text" placeholder=' "Apple"' value={this.state.value} onChange={this.handleChange} />
            </label> <input type="submit" value="Search" />
            <div className={`suggestText ${hiddenOnLoad}`}>
              Enter an ingredient above to see results!
            </div>
          </form>
        </div>
        <div className="colLeft">
          <div id='mealList' className={`flexContainer ${hiddenBeforeLoad}`}>
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>Name</th>
                  {nutrientDisplayName.map((data) => { return (<th>{data}</th>) })}
                </tr>
                {this.state.foods.map((data, key) => {
                  let nutrients = data.foodNutrients;
                  let display = defaultDisplay;

                  for (var x = 0; x < nutrients.length; x++) {
                    let nut = nutrients[x];

                    for (var i = 0; i < numNut; i++) {
                      if (nut.nutrientName === nutrientsOfInterest[i]) {
                        display[i] = printStandardizedUnit(nut.value, nut.unitName);
                        break;
                      }
                    }
                  }

                  return (
                    <tr>
                      <td id="mealButton"><button type="button" className="insetButton" onClick={this.handleClick(data.fdcId)}>Select</button></td>
                      <td>{data.description}</td>
                      {display.map((data) => { return (<td>{data}</td>) })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="colRight">
          <div id='mealTable' className={`flexContainer ${hiddenBeforeLoad}`}>
            <table>
              <tbody>
                <tr>
                  <th style={{ textAlign: "left" }}>
                    Ingredients: {"\n"}<h3>{this.state.selectedIngredient.description}</h3>
                  </th>
                </tr>
                <tr>
                  <td style={{ padding: "10px 20px" }}>
                    {this.state.selectedIngredient.ingredients}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function getMealNutrients(meal) {
  return meal.totalNut;
}

let emptyMeal = {
  'name': "__defaultMeal__",
  'ingredients': [],
  // Use these at end before "saving" meal
  'totalNut': [0, 0, 0, 0], //TODO: Automate the size of this
  'nutrients': {
    'cal': 0,
    'protein': 0,
    'sodium': 0,
    'fat': 0
  }
};

function saveMeal(name, meal) {
  localStorage.setItem(name, JSON.stringify(meal));
}

function getMeal(name) {
  return JSON.parse(localStorage.getItem(name));
}

function mealExists(name) {
  if (localStorage.getItem(name) === null)
    return false;
  return true;
}

let havestedNutValues = {};

// Allows one to make a new meal
class MealMaker extends React.Component {
  constructor(props) {
    super(props);

    //localStorage.clear(); //!------TEMP FOR TESTING

    if (!mealExists("__defaultMeal__")) {
      saveMeal("__defaultMeal__", emptyMeal);
    }
    let curMeal = getMeal("__defaultMeal__");

    this.state = {
      value: '',
      currentMeal: curMeal,
      foods: [],
      isLoaded: false,
      saveAs: ""
    };

    // Get named meals
    if (mealExists("__mealList__")) {
      savedMeals = getMeal("__mealList__");
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateSaveName = this.updateSaveName.bind(this);
    this.saveMealEvent = this.saveMealEvent.bind(this);
  }

  //* Update the ingredient search term
  handleChange(event) {
    clearTimeout(detectInput);
    this.setState({ value: event.target.value });
    detectInput = setTimeout(() => {
      console.log("Input!");
    }, 2000);
  }

  //* Searches for ingredients by name
  handleSubmit(event) {
    event.preventDefault();
    fetch("https://api.nal.usda.gov/fdc/v1/foods/search?api_key=****" + encodeURIComponent(this.state.value))
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            apiReturn: result,
            foods: result.foods
          });
          console.log(this.state.apiReturn.foods);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  //* Sets the current meal's name
  updateSaveName(event) {
    this.setState({ saveAs: event.target.value });
  }

  //* Saves the current meal
  saveMealEvent(event) {
    event.preventDefault();
    if (this.state.saveAs != "") {
      let overwrite = false;
      let userConfirm = true;
      if (savedMeals.includes(this.state.saveAs)) {
        overwrite = true;
        userConfirm = window.confirm("Do you want to overwrite existing meal named " + this.state.saveAs + "?");
      }

      if (userConfirm) {
        let curMeal = getMeal("__defaultMeal__");
        saveMeal(this.state.saveAs, curMeal);
        saveMeal("__defaultMeal__", emptyMeal);
        this.setState({ saveAs: "", currentMeal: emptyMeal });

        if (!overwrite) {
          savedMeals.push(this.state.saveAs);
          saveMeal("__mealList__", savedMeals);
        }
        console.log(savedMeals);
      }
    }
    else
      alert("Please enter a meal name");
  }

  //* Adds an ingredient to the current meal
  addIngredient = value => () => {
    let curMeal = getMeal("__defaultMeal__");

    // Find ingredient in API return
    let index = this.state.foods.findIndex(obj => obj.fdcId == value);
    let ing = this.state.foods[index];

    // Add ingredient to current meal
    let nut = havestedNutValues[value];
    curMeal.ingredients.push({ 'id': value, 'name': ing.description, 'nutrients': nut });
    for (var i = 0; i < nut.length; i++) {
      curMeal.totalNut[i] += nut[i];
    }

    // Save
    saveMeal("__defaultMeal__", curMeal);
    this.setState({ currentMeal: curMeal });
  };

  //* Removes an ingredient from the current meal
  removeIngredient = value => () => {
    let curMeal = getMeal("__defaultMeal__");

    // Find and remove ingredient (first instance)
    let index = curMeal.ingredients.findIndex(obj => obj.id == value);

    let nut = curMeal.ingredients[index].nutrients;
    for (var i = 0; i < nut.length; i++) {
      curMeal.totalNut[i] -= nut[i];
    }
    curMeal.ingredients.splice(index, 1);

    // Save
    saveMeal("__defaultMeal__", curMeal);
    this.setState({ currentMeal: curMeal });
  };

  render() {
    let nutrientsOfInterest = ["Energy", "Protein", "Sodium, Na", "Total lipid (fat)"];
    let nutrientDisplayName = ["Calories", "Protein", "Sodium", "Fat"];
    let nutrientUnits = ["KCAL", "G", "MG", "G"];
    let defaultDisplay = [];
    let defaultValues = [];
    let numNut = nutrientsOfInterest.length;
    for (var i = 0; i < numNut; i++) {
      defaultDisplay.push("-");
      defaultValues.push(0.0);
    }

    let hiddenBeforeLoad = "hidden";
    let hiddenOnLoad = "";
    if (this.state.isLoaded === true) {
      hiddenBeforeLoad = "";
      hiddenOnLoad = "hiddenOnLoad"
    }

    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              Search for <input className="roundedEntry" type="text" placeholder=' "Chicken"' value={this.state.value} onChange={this.handleChange} />
            </label> <input type="submit" value="Search" />
            <div className={`suggestText ${hiddenOnLoad}`}>
              Enter an ingredient above to start making a meal!
          </div>
          </form>
        </div>
        <div className="colLeft">
          <div id='mealList' className={`flexContainer ${hiddenBeforeLoad}`}>
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>Name</th>
                  {nutrientDisplayName.map((data) => { return (<th>{data}</th>) })}
                </tr>
                {this.state.foods.map((data, key) => {
                  let nutrients = data.foodNutrients;
                  let display = defaultDisplay;
                  let values = defaultValues;

                  for (var x = 0; x < nutrients.length; x++) {
                    let nut = nutrients[x];

                    for (var i = 0; i < numNut; i++) {
                      if (nut.nutrientName === nutrientsOfInterest[i]) {
                        display[i] = printStandardizedUnit(nut.value, nut.unitName);
                        values[i] = standardizeUnit(nut.value, nut.unitName)[0];
                        break;
                      }
                    }
                  }

                  // Update custom values
                  havestedNutValues[data.fdcId] = values.slice();

                  return (
                    <tr>
                      <td id="mealButton"><button type="button" className="insetButton" onClick={this.addIngredient(data.fdcId)}>Add</button></td>
                      <td>{data.description}</td>
                      {display.map((data) => { return (<td>{data}</td>) })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="colRight">
          <table id='mealTable'>
            <tbody>
              <tr>
                <th>Ingredients Added</th>
              </tr>
              {this.state.currentMeal.ingredients.map((data) => {
                return (
                  <tr>
                    <td id='mealAdded'><button type="button" className="removeButton" onClick={this.removeIngredient(data.id)}>❌</button> {data.name}</td>
                  </tr>
                )
              })}
              <div id="mealStats">
                <form onSubmit={this.saveMealEvent}>
                  <label>
                    Save as <input className="roundedEntry" type="text" placeholder="Meal Name" value={this.state.saveAs} onChange={this.updateSaveName} />
                  </label> <input type="submit" value="Save" />
                </form>
                {nutrientDisplayName.map((nm, index) => {
                  return <span className="totalStat">{Math.round(this.state.currentMeal.totalNut[index])} {nutrientUnits[index]} {nm}</span>
                })}
              </div>
            </tbody>
          </table>

        </div>
      </div>
    );
  }
}

const mealTypes = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Snack", label: "Snack" }
];
let cheatJs = [0];

// Allows one to select a meal to mark as eaten
class MealBrowser extends React.Component {
  constructor(props) {
    super(props);

    let today = stringifyDate(new Date());

    let mealStruct = [];
    for (let i in savedMeals) {
      mealStruct.push({ value: savedMeals[i], label: savedMeals[i] });
    }
    const meals = mealStruct;

    this.state = {
      isLoaded: false,
      today: today,
      setDate: today,
      meals: meals,
      time: "",
      foods: []
    };

    if (mealExists("__mealList__")) {
      savedMeals = getMeal("__mealList__");
    }

    this.dateChange = this.dateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.foodsChange = this.foodsChange.bind(this);
    this.timeChange = this.timeChange.bind(this);
  }

  dateChange(event) {
    this.setState({ setDate: event.target.value });
  }

  foodsChange(event) {
    let f = [];
    for (let i in event) {
      f.push(event[i].value);
    }
    this.setState({ foods: f });
  }

  timeChange(event) {
    this.setState({ time: event.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    let foods = this.state.foods;
    let day = this.state.setDate;
    let time = this.state.time;

    if (foods !== [] && time !== "") {
      saveMealEaten(foods, time, day);
      this.setState({ time: time });
      //window.location.reload(false);
    }
    else
      alert("Please fully fill out form.");
  }

  render() {
    // Chart Use
    let data = {
      labels: ["Calories", "Protein", "Sodium", "Fat"],
      datasets: [
        {
          label: 'Target (%)',
          data: [0, 0, 0, 0],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    }
    const options = {
      scale: {
        ticks: {
          beginAtZero: true,
          suggestedMin: 50,
          suggestedMax: 100
        },
      },
    }

    let dat = "";

    let mealsToday = getMealsEaten(this.state.setDate);
    if (mealsToday !== []) {
      let ate = ["", "", "", ""];
      let cal = 0;
      let fat = 0;
      let pro = 0;
      let sod = 0;

      for (let x in mealsToday) {
        let mealToday = mealsToday[x];

        cal += mealToday.calories;
        fat += mealToday.sodium;
        pro += mealToday.fat;
        sod += mealToday.protein;

        for (let y in mealToday.foods) {
          if (mealToday.time === "Breakfast")
            ate[0] += mealToday.foods[y] + ", ";
          else if (mealToday.time === "Lunch")
            ate[1] += mealToday.foods[y] + ", ";
          else if (mealToday.time === "Dinner")
            ate[2] += mealToday.foods[y] + ", ";
          else
            ate[3] += mealToday.foods[y] + ", ";
        }
      }
      // Populate day
      if (ate[0] !== "")
        dat += "Breakfast: " + ate[0].slice(0, -2) + "\n";
      if (ate[1] !== "")
        dat += "Lunch: " + ate[1].slice(0, -2) + "\n";
      if (ate[2] !== "")
        dat += "Dinner: " + ate[2].slice(0, -2) + "\n";
      if (ate[3] !== "")
        dat += "Snacks: " + ate[3].slice(0, -2) + "\n";

      dat += "\n~\n";
      dat += 'Calories: ' + Math.round(cal) + ' KCAL\n';
      dat += 'Protein: ' + Math.round(pro) + ' G\n';
      dat += 'Sodium: ' + Math.round(sod) + ' MG\n';
      dat += 'Fat: ' + Math.round(fat) + ' G\n';

      function percenty(daily, actual) {
        return (actual / daily) * 100;
      }

      data.datasets[0].data = [percenty(2000, cal), percenty(50, pro), percenty(2300, sod), percenty(50, fat)];
    }

    // Set default meal for redirect
    let defaultMeal = this.state.time;
    if (this.state.time === "") {
      let curPage = window.location.href;
      if (curPage.includes("breakfast"))
        defaultMeal = mealTypes[0];
      else if (curPage.includes("lunch"))
        defaultMeal = mealTypes[1];
      else if (curPage.includes("dinner"))
        defaultMeal = mealTypes[2];
      else if (curPage.includes("snack"))
        defaultMeal = mealTypes[3];
    }

    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit} className="addMealsForm">
            <label>I had </label>
            <Select isMulti options={this.state.meals} onChange={this.foodsChange} />

            <br /><label> for </label>
            <Select options={mealTypes} defaultValue={defaultMeal} onChange={this.timeChange} />

            <br /><label> on {'\u00A0'}</label>
            <input type="date" id="mealEatenOn" name="mealEatenOn"
              value={this.state.setDate} max={this.state.today}
              onChange={this.dateChange} />
            <input className="iAteSubmit" type="submit" value="Enter" />
          </form>
        </div>
        <div id='addMealChart' className="row">
          <div className="colLeft">
            <Radar data={data} options={options} />
          </div>
          <div id='mealList' className="colRight">
            <table >
              <tbody>
                <tr>
                  <th style={{ padding: "2px 50px" }}>
                    Stats for {this.state.setDate}
                  </th>
                </tr>
                {dat.split('\n').map((item, i) => <tr style={{ textAlign: "center" }}>{item}</tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

class MealChart extends React.Component {
  constructor(props) {
    super(props);

    let today = stringifyDate(new Date());

    let mealStruct = [];
    for (let i in savedMeals) {
      mealStruct.push({ value: savedMeals[i], label: savedMeals[i] });
    }
    const meals = mealStruct;

    this.state = {
      isLoaded: false,
      today: today,
      setDate: today,
      meals: meals,
      time: "",
      foods: []
    };

    this.dateChange = this.dateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.foodsChange = this.foodsChange.bind(this);
    this.timeChange = this.timeChange.bind(this);
  }

  dateChange(event) {
    this.setState({ setDate: event.target.value });
  }

  foodsChange(event) {
    let f = [];
    for (let i in event) {
      f.push(event[i].value);
    }
    this.setState({ foods: f });
  }

  timeChange(event) {
    this.setState({ time: event.value });
  }

  handleSubmit(event) {
    event.preventDefault();

    let foods = this.state.foods;
    let day = this.state.setDate;
    let time = this.state.time;
  }

  render() {
    // Chart Use
    let data = {
      labels: ["Calories", "Protein", "Sodium", "Fat"],
      datasets: [
        {
          label: 'Target (%)',
          data: [0, 0, 0, 0],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    }
    const options = {
      scale: {
        ticks: {
          beginAtZero: true,
          suggestedMin: 50,
          suggestedMax: 100
        },
      },
    }

    let dat = "";

    let mealsToday = getMealsEaten(this.state.setDate);
    if (mealsToday !== []) {
      let ate = ["", "", "", ""];
      let cal = 0;
      let fat = 0;
      let pro = 0;
      let sod = 0;

      for (let x in mealsToday) {
        let mealToday = mealsToday[x];

        cal += mealToday.calories;
        fat += mealToday.sodium;
        pro += mealToday.fat;
        sod += mealToday.protein;

        for (let y in mealToday.foods) {
          if (mealToday.time === "Breakfast")
            ate[0] += mealToday.foods[y] + ", ";
          else if (mealToday.time === "Lunch")
            ate[1] += mealToday.foods[y] + ", ";
          else if (mealToday.time === "Dinner")
            ate[2] += mealToday.foods[y] + ", ";
          else
            ate[3] += mealToday.foods[y] + ", ";
        }
      }
      // Populate day
      if (ate[0] !== "")
        dat += "Breakfast: " + ate[0].slice(0, -2) + "\n";
      if (ate[1] !== "")
        dat += "Lunch: " + ate[1].slice(0, -2) + "\n";
      if (ate[2] !== "")
        dat += "Dinner: " + ate[2].slice(0, -2) + "\n";
      if (ate[3] !== "")
        dat += "Snack: " + ate[3].slice(0, -2) + "\n";

      dat += "\n";
      dat += 'Calories: ' + Math.round(cal) + ' KCAL\n';
      dat += 'Protein: ' + Math.round(pro) + ' G\n';
      dat += 'Sodium: ' + Math.round(sod) + ' MG\n';
      dat += 'Fat: ' + Math.round(fat) + ' G\n';

      function percenty(daily, actual) {
        return (actual / daily) * 100;
      }

      data.datasets[0].data = [percenty(2000, cal), percenty(50, pro), percenty(2300, sod), percenty(50, fat)];
    }

    return (
      <div className="row">
        <Radar data={data} options={options} />
      </div>
    );
  }
}

class AuthenticationClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
      isSignedIn: false
    };
  }

  Login() {
    const onSuccess = (res) => {
      //console.log('[Login Success] currentUser: ', res.profileObj);
      userName = res.profileObj.givenName;
      this.setState({ userDetails: res.profileObj, isSignedIn: true });
    }
    const onFailure = (res) => {
      //console.log('[Login failed] res:', res);
      this.setState({ userDetails: undefined, isSignedIn: false });
    };

    return (
      <div>
        <GoogleLogin
          clientId={clientId}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          cookiePolicy={'single_host_origin'}
          style={{ marginTop: '10px' }}
          isSignedIn={true}
        />
      </div>
    );
  }

  Logout() {
    const onSuccess = () => {
      alert('Logout made successfully');
      //this.setState({isUSerLoggedIn: false});
      window.location.reload(false);
    };

    return (
      <div>
        <GoogleLogout
          clientId={clientId}
          buttonText="Logout"
          onLogoutSuccess={onSuccess}
          isSignedIn={false}
        ></GoogleLogout>
      </div>
    );
  }



  render() {
    if (this.state.isSignedIn == false) {
      return this.Login();
    }
    else {
      return this.Logout();
    }

  }

}

// ==========================================
// Pages 
// ==========================================
function Home() {

  //setInterval(function(){ console.log(userName); }, 1000);

  return (
    <div className="sectionBody homeBg">
      <Container>
        <h1>Welcome {userName}!</h1>
        <p>
          A healthy diet is one that helps maintain or improve overall health. <br />
        Tracking your macronutrients is more important than you think. <br />
        This app will help you track your everyday macronutrients intake for breakfast, lunch, dinner, and snack.
      </p>
        <p>

        </p>
        <Row>
          <Col>
            <>
              <div>
                <h2 style={{ marginRight: "54px" }}>
                  I Just Had...
              </h2>
              </div>
              <div className="panel btncolor">
                <a style={{ textDecoration: 'none' }} href="/addmeal/breakfast">
                  <Button className="btn" variant="" size="lg" block>
                    Breakfast
                </Button>
                </a>
              </div>
              <div className="panel btncolor">
                <a style={{ textDecoration: 'none' }} href="/addmeal/lunch">
                  <Button className="btn" variant="" size="lg" block>
                    Lunch
                </Button>
                </a>
              </div>
              <div className="panel btncolor">
                <a style={{ textDecoration: 'none' }} href="/addmeal/dinner">
                  <Button className="btn" variant="" size="lg" block>
                    Dinner
                </Button>
                </a>
              </div>
              <div className="panel btncolor">
                <a style={{ textDecoration: 'none' }} href="/addmeal/snack">
                  <Button className="btn" variant="" size="lg" block>
                    Snack
                </Button>
                </a>
              </div>
            </>
          </Col>
          <Col>
            <div>
              <h2>
                Today So Far
            </h2>
            </div>
            <MealChart></MealChart>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function Ingredients() {
  return (
    <div className="sectionBody ingredientsBg">
      <Container>
        <h1>Ingredient Explorer</h1>
        <IngredientPicker></IngredientPicker>
      </Container>
    </div>
  );
}

function Meals() {
  return (
    <div className="sectionBody mealsBg">
      <Container>
        <h1>Meal Maker</h1>
        <MealMaker></MealMaker>
      </Container>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="sectionBody dashboardBg">
      <Container>
        <h1>Add Meals</h1>
        <MealBrowser></MealBrowser>
      </Container>
    </div>
  );
}

function Calendar() {
  return (
    <div className="sectionBody tabBg">
      {cheatJs.map((data) => {
        populateCalender();
        return ("")
      })}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={calData}
      />
    </div>
  );
}

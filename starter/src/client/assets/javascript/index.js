// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	track_name: undefined,
	player_id: undefined,
	player_name: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	console.log("Getting form info for dropdowns!")
	try {
		await getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		await getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			store.track_id = target.id
			store.track_name = target.innerHTML
		}

		// Racer form field
		if (target.matches('.card.racer')) {
			handleSelectRacer(target)
			store.player_id = target.id
			store.player_name = target.innerHTML
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

		console.log("Store updated :: ", store)
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

// BELOW THIS LINE IS CODE WHERE STUDENT EDITS ARE NEEDED ----------------------------
// TIP: Do a full file search for TODO to find everything that needs to be done for the game to work

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	console.log("in create race")

	try {
		const player_id = store.player_id;
		const track_id = store.track_id;
		if (!player_id || !track_id) {
			alert(`To start the race, please select a track and player!`)
			return
		} else {			
			const race = await createRace(player_id, track_id);
			store.race_id = parseInt(race.ID) - 1;

	// render starting UI
			renderAt('#race', renderRaceStartView(race.Track, race.Cars))

			await runCountdown();
			await startRace(store.race_id);
			await runRace(store.race_id);
		}
	} 
	catch(err) {
		console.log(`handleCreateRace error::`, err.message);
		console.error(err);
	}
	console.log("RACE: ", race)
}

async function runRace(raceID) {
	try {
	return new Promise(resolve => {
			const raceInterval = setInterval(async () => {
				const getRaceResponse = await getRace(raceID);
				if(getRaceResponse.status === "in-progress") {
					renderAt('#leaderBoard', raceProgress(getRaceResponse.positions));
				} else if(getRaceResponse.status === "finished") { 
					clearInterval(raceInterval); 
					renderAt('#race', resultsView(getRaceResponse.positions));
					resolve(getRaceResponse); 
				} 
			}, 500)
		})
	} 
	catch (err) {
		console.log(`Error in runRace::`, err.message);
		console.error(err);
	}
}

async function runCountdown() {
	try {
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			const countdownInterval = setInterval(()=> {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer;
				if (timer <= 0) {
					clearInterval(countdownInterval);
					resolve("done");
					return;
				}
			},1000)
		})
	} catch(err) {
		console.log(`runCountdown error::`, err.message);
		console.error(err);
	}
}

function handleSelectRacer(target) {
	console.log("selected a racer", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// convert player_id to int
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("selected track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')	

	// convert track_id to int
	store.track_id = parseInt(target.id);
}

async function handleAccelerate() {
	console.log("accelerate button clicked")
	try {
		await accelerate(store.race_id);
	} catch(err) {
		console.log(`handleAccelerate error::`, err.message);
		console.error(err);
	} 
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	return `<h4 class="card racer" id="${id}">${driver_name}</h3>`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name, segments } = track

	return `<h4 id="${id}" class="card track">${name}</h4>`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1);
	const first = positions.filter(player => player.final_position === 1);
	
	return `
		<header class="header-wrap">
			<h1>${first[0].driver_name} wins!</h1>
		</header>
		<main class="wrapper-results">
			${raceProgress(positions)}
			<a class="start-button" href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<table>
			${results.join('')}
		</table>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:3001'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	console.log(`calling server :: ${SERVER}/api/tracks`)
	try {
		const response = await fetch(`${SERVER}/api/tracks`); 
		const data = await response.json(); 
		return data; 
	}
	catch (err) {
		console.log(`getTracks request error::`, err.message)
		console.error(err)
	}
}

async function getRacers() {
	try {
		const response = await fetch(`${SERVER}/api/cars`); 		
		const data = await response.json();
		return data;
	}
	catch (err) {
		console.log(`getRacers request error::`, err.message)
		console.error(err)
	}
}

async function createRace(player_id, track_id) {
	try {
		player_id = parseInt(player_id)
		track_id = parseInt(track_id)
		const body = { player_id, track_id }
		
		const response = await fetch(`${SERVER}/api/races`, {
			method: 'POST',
			...defaultFetchOpts(),
			dataType: 'jsonp',
			body: JSON.stringify(body)
		})
		const data = await response.json();
		return data;
	} catch (err) {
		console.log("createRace request error::", err)
		console.error(err)
	}
}

async function getRace(id) {
	try {
		const response = await fetch(`${SERVER}/api/races/${id}`);
		const data = await response.json();
		return data;
	}
	catch (err) {
		console.log(`getRace request error::`, err.message);
		console.error(err)
	}
}

async function startRace(id) {
	return await fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	// .then(res => res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

async function accelerate(id) {
	return await fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch((err) => {
		console.log(`Problem with accelerate request::`, err.message);
		console.log(err)
	})
}

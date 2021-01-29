/* eslint-disable no-undef */
export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.leaderboardScoreCount = 10;
		this.validateLoginToken();
		this.getHTMLElements();
		this.createFormSubmitEventListeners();
		this.setProfileButtonPosition();
		this.refreshLeaderboard(this.leaderboardScoreCount);
	}

	loadAssets() {
		this.logged_in = this.game.util.loadImage('/img/logged_in.png', this);
		this.logged_out = this.game.util.loadImage('/img/logged_out.png', this);
	}

	setProfileButtonPosition() {
		let leftEdgeX = this.game.gameWidth > window.innerWidth ? (Math.floor((this.game.gameWidth - window.innerWidth) / 2.0)) : 0;
		let topEdgeY = this.game.gameHeight > window.innerHeight ? (Math.floor((this.game.gameHeight - window.innerHeight) / 2.0)) : 0;
		let cornerOffset = 2;
		this.x = leftEdgeX + cornerOffset;
		this.y = topEdgeY + cornerOffset;
		this.profileButton.style.top = cornerOffset + 'px';
		this.profileButton.style.left = cornerOffset + 'px';
	}

	// authenticate the current locally-stored login token with the server, which responds with user data
	validateLoginToken() {
		let loginToken = window.localStorage.getItem('loginToken');

		if (loginToken) {
			let headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${loginToken}`
			};
			let body = {};
			let method = 'POST', route = '/api/validate';
			this.game.util.request(method, route, headers, body).then(res => {
				console.log(method, route, res);
				if (res.ok) {
					this.isLoggedIn = true;
					this.userData = res.data;
					this.loggedInUsername.innerText = this.userData.username + ' ' + this.userData.score;
				}
			}).catch(err => console.log(err));
		} else {
			this.isLoggedIn = false;
		}
	}

	getHTMLElements() {
		this.profileButton = document.getElementById('user-profile');
		this.profileButton.owner = this;
		this.profileButton.onclick = this.profileButton.owner.userProfileButtonClickHandler;

		this.signInOrRegister = document.getElementById('sign-in-or-register');

		this.signInButton = document.getElementById('sign-in-btn');
		this.signInButton.owner = this;
		this.signInButton.onclick = this.signInButton.owner.signInButtonClickHandler;

		this.signInForm = document.getElementById('sign-in-form');
		this.signInFormSection = document.getElementById('sign-in-form-section');
		this.signInUsername = document.getElementById('sign-in-username');
		this.signInPassword = document.getElementById('sign-in-password');
		this.signInError = document.getElementById('sign-in-error');
		
		this.registerButton = document.getElementById('register-btn');
		this.registerButton.owner = this;
		this.registerButton.onclick = this.registerButton.owner.registerButtonClickHandler;

		this.registerForm = document.getElementById('register-form');
		this.registerFormSection = document.getElementById('register-form-section');
		this.registerEmail = document.getElementById('register-email');
		this.registerUsername = document.getElementById('register-username');
		this.registerPassword = document.getElementById('register-password');
		this.registerError = document.getElementById('register-error');

		this.loggedInInfoSection = document.getElementById('logged-in-info-section');
		this.loggedInUsername = document.getElementById('logged-in-username');
		this.signOutButton = document.getElementById('sign-out-btn');
		this.signOutButton.owner = this;
		this.signOutButton.onclick = this.signOutButton.owner.signOut;

		this.leaderboardButton = document.getElementById('leaderboard-btn');
		this.leaderboardButton.owner = this;
		this.leaderboardButton.onclick = this.leaderboardButtonClickHandler;
		this.leaderboardButton.innerText = 'Top ' + this.leaderboardScoreCount;
		this.leaderboard = document.getElementById('leaderboard');
	}

	createFormSubmitEventListeners() {
		this.signInForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			// show any validation errors
			if (messages.length > 0) {
				this.signInError.innerText = messages.join('\n');
			} else {
				let headers = {
					'Content-Type': 'application/json'
				};
				let body = {
					username: this.signInUsername.value,
					password: this.signInPassword.value
				};
				// post request to login api
				let method = 'POST', route = '/api/login';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideSignInForm();
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.signInError.innerText = messages.join('\n');
					}
				}).catch(err => console.log(err));
			}
		});

		this.registerForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			if (!this.game.util.isAlphaNumeric(this.registerUsername.value)) {
				messages.push('username must be alphanumeric only');
			}

			if (this.registerUsername.value.length < 3) {
				messages.push('username must be at least 3 characters');
			} else if (this.registerUsername.value.length > 16) {
				messages.push('username must be no more than 16 characters');
			}

			if (this.registerPassword.value.length < 8) {
				messages.push('password must be at least 8 characters');
			}

			// show any validation errors
			if (messages.length > 0) {
				this.registerError.innerText = messages.join('\n');
			} else {
				let headers = {
					'Content-Type': 'application/json'
				};
				let body = {
					email: this.registerEmail.value,
					username: this.registerUsername.value,
					password: this.registerPassword.value
				};
				// post request to register api
				let method = 'POST', route = '/api/register';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideRegisterForm();
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.registerError.innerText = messages.join('\n');
					}
				}).catch(err => console.log(err));
			}
		});
	}

	userProfileButtonClickHandler() {
		if (!this.owner.isLoggedIn) {
			if (this.owner.signInOrRegister.style.display == 'block') {
				this.owner.hideSignInOrRegister();
			} else {
				this.owner.showSignInOrRegister();
			}

			if (this.owner.signInFormSection.style.display == 'block') {
				this.owner.hideSignInForm();
				this.owner.hideSignInOrRegister();
			}

			if (this.owner.registerFormSection.style.display == 'block') {
				this.owner.hideRegisterForm();
				this.owner.hideSignInOrRegister();
			}
		} else {
			if (this.owner.loggedInInfoSection.style.display == 'block') {
				this.owner.hideLoggedInInfo();
			} else {
				this.owner.showLoggedInInfo();
			}
			this.owner.leaderboard.innerHTML = '';
		}
	}

	signInButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.signInFormSection.style.display = 'block';
		this.owner.signInUsername.value = '';
		this.owner.signInPassword.value = '';
		this.owner.signInError.innerText = '';
		this.owner.signInUsername.focus();
	}

	registerButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.registerFormSection.style.display = 'block';
		this.owner.registerEmail.value = '';
		this.owner.registerUsername.value = '';
		this.owner.registerPassword.value = '';
		this.owner.registerError.innerText = '';
		this.owner.registerEmail.focus();
	}

	leaderboardButtonClickHandler() {
		if (this.owner.leaderboard.innerHTML == '') {
			this.owner.refreshLeaderboard(this.owner.leaderboardScoreCount);
		} else {
			this.owner.leaderboard.innerHTML = '';
		}
	}

	refreshLeaderboard(numToRetrieve) {
		let headers = {
			'Content-Type': 'application/json'
		};
		let body = {};
		let method = 'GET', route = '/api/leaderboard/' + numToRetrieve;
		this.game.util.request(method, route, headers, body).then(res => {
			console.log(method, route, res);

			if (res.ok) {
				let html = '<ol>';
				for (let i = 0; i < res.data.length; i++) {
					let username = res.data[i].username, score = res.data[i].score;
					html += '<li>' + username + ' ' + score + '</li>';
				}

				let numToLeaveBlank = numToRetrieve - res.data.length;
				for (let i = 0; i < numToLeaveBlank; i ++) {
					html += '<li></li>';
				}

				html += '</ol>';
				this.leaderboard.innerHTML = html;
			}
		}).catch(err => console.log(err));
	}

	signOut() {
		window.localStorage.removeItem('loginToken');
		this.owner.loggedInUsername.innerText = '';
		this.owner.leaderboard.innerHTML = '';
		this.owner.isLoggedIn = false;
		this.owner.hideLoggedInInfo();
	}

	showSignInForm() {
		this.signInFormSection.style.display = 'block';
	}

	hideSignInForm() {
		this.signInFormSection.style.display = 'none';
	}

	showRegisterForm() {
		this.registerFormSection.style.display = 'block';
	}

	hideRegisterForm() {
		this.registerFormSection.style.display = 'none';
	}

	showSignInOrRegister() {
		this.signInOrRegister.style.display = 'block';
	}

	hideSignInOrRegister() {
		this.signInOrRegister.style.display = 'none';
	}

	showLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'block';
	}

	hideLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'none';
	}

	draw(ctx) {
		ctx.drawImage(this.isLoggedIn ? this.logged_in : this.logged_out, this.x, this.y);
	}
}
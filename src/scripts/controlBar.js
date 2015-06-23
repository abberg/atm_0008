(function( ab, component, styles ){
	"use strict";

	ab.controlBar = function(loop, canvas){
		var that = component(),
			el,
			hideTimeoutId,
			stepTimeoutId,
			recordFrameDuration = 1000/12, // 12fps
			recordLoop = ab.gameLoop({timestep: recordFrameDuration}),
			canvasCopy = document.createElement("canvas"),
  			copyContext = canvasCopy.getContext("2d"),
			gif,
			
			onMouseEnter = function(event){
				
				var body = el.querySelector('.js-body');
				if(body.classList.contains('is-hidden')){
					body.classList.remove('is-hidden');
				}
				if(hideTimeoutId){
					clearTimeout(hideTimeoutId);
				}
				
			},
			
			onMouseLeave = function(event){
				
				var body = el.querySelector('.js-body');
				hideTimeoutId = setTimeout(function(){
					body.classList.add('is-hidden');
					hideTimeoutId = undefined;
				}, 500);
				
			},

			onPlayPauseClick = function(event){
				var stepBtn = el.querySelector('.js-step');
				if(event.target.classList.contains('is-playing')){
					// pause
					stepBtn.disabled = false;
					event.target.classList.remove('is-playing');
					loop.stop();
				}else{
					// play
					stepBtn.disabled = true;
					event.target.classList.add('is-playing');
					loop.start();
				}
			},

			onStepMouseDown = function(event){			
				var startTime = new Date(),
					ease = function (currentIteration, startValue, changeInValue, totalIterations) {
						return changeInValue * (currentIteration /= totalIterations) * currentIteration + startValue;
					},
					step = function(){
						
						var startTimeout = 300,
							endTimeout = 50,
							change = endTimeout - startTimeout,
							duration = 1000,
							currentTime = new Date(),
							elapsedTime = currentTime - startTime,
							timeout;

						if(elapsedTime < duration){
							timeout = ease(elapsedTime, startTimeout, change, duration);
						}else{
							timeout = 50;
						}

						stepTimeoutId = setTimeout(function(){
							step()
						}, timeout);

						loop.step();
					}
				
				step();
			},
			
			onStepMouseUp = function(event){
				clearTimeout(stepTimeoutId);
			},
			
			onSpeedInput = function(event){
				loop.speed(event.target.value);
				var slider = el.querySelector('.js-speed'),
					speedDisplay = el.querySelector('.js-speed-display');

				if(event.target === slider){
					speedDisplay.value = event.target.value;
				}else if(event.target === speedDisplay){
					slider.value = event.target.value;
				}
			},

			onScreencapClick = function(event){
				
				var img = createFrameImage(),
            		win = window.open();

            	win.document.body.appendChild(img);
            
			},

			onRecordClick = function(event){
				var icon = event.target.querySelector('.Icon-record');

				icon.classList.toggle('is-recording');

				if(icon.classList.contains('is-recording')){
				
					recordLoop.start();
					gif = new GIF({
						workerScript:'scripts/lib/gif.worker.js'
					});

				}else{
				
					recordLoop.stop();
					gif.on('finished', function(blob) {
  						window.open(URL.createObjectURL(blob));
					});
					gif.render();
				
				}
			},

			onRecordUpdate = function(event){
				console.log('frame');
				gif.addFrame(createFrameImage(700, 270), {delay: recordFrameDuration});
			},

			createFrameImage = function(width, height){
				var img = document.createElement('img'),
					imgData;

				canvasCopy.width = width || 384;
  				canvasCopy.height = height || 152;

  				copyContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasCopy.width, canvasCopy.height);
            	imgData = canvasCopy.toDataURL();
            	img.src = imgData;
				return img;
			},

			wire = function(element){
				
				el = element
				
				el.addEventListener('mouseenter', onMouseEnter);
				el.addEventListener('mouseleave', onMouseLeave);
				
				el.addEventListener('click', function(event){
					if(event.target.classList.contains('js-play-pause')){
						onPlayPauseClick(event);
					}
					if(event.target.classList.contains('js-screencap')){
						onScreencapClick(event);
					}
					if(event.target.classList.contains('js-record')){
						onRecordClick(event);
					}
				});

				el.addEventListener('mousedown', function(event){
					if(event.target.classList.contains('js-step')){
						onStepMouseDown(event);
					}
				});

				el.addEventListener('mouseup', function(event){
					if(event.target.classList.contains('js-step')){
						onStepMouseUp(event);
					}
				});
				
				el.addEventListener('input', function(event){
					if(event.target.classList.contains('js-speed') || event.target.classList.contains('js-speed-display')){
						onSpeedInput(event);
					}
				});

				recordLoop.addEventListener('frameupdate', function(event){
					onRecordUpdate(event);	
				});

			},

			template = `<div class="ControlBar fixed bottom-0 right-0 left-0 z1">
				<div class="ControlBar-body flex is-hidden js-body">
					<fieldset class="mx-auto border-bottom-none bg-near-black border-dark-gray rounded-top gray padd-2 shadow-1">
						<button class="PlayPauseBtn is-playing gray button-outline js-play-pause">
							<span class="PlayPauseBtn-label">
								<span class="PlayPauseBtn-pauseLabel">
									Pause 
									<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
										 viewBox="0 0 1365 1024" 
										 class="icon" 
									>
										<path class="path1" d="M321.057 132.986v748.751h-187.189v-748.751h187.189zM321.057 8.192h-187.189c-68.92 0-124.791 55.875-124.791 124.791v748.751c0 68.919 55.871 124.791 124.791 124.791h187.189c68.92 0 124.791-55.875 124.791-124.791v-748.751c0-68.919-55.871-124.791-124.791-124.791v0zM882.621 132.986v748.751h-187.189v-748.751h187.189zM882.621 8.192h-187.189c-68.92 0-124.791 55.875-124.791 124.791v748.751c0 68.919 55.871 124.791 124.791 124.791h187.189c68.92 0 124.791-55.875 124.791-124.791v-748.751c0-68.919-55.871-124.791-124.791-124.791v0z"></path>
									</svg>
								</span>
								<span class="PlayPauseBtn-playLabel">
									Play 
									<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
										 viewBox="0 0 1365 1024" 
										 class="icon" 
									>
										<path class="path1" d="M147.489 128.083l748.751 374.378-748.751 374.378v-748.751zM147.499 3.29c-22.819 0-45.577 6.251-65.615 18.638-36.794 22.732-59.188 62.9-59.188 106.153v748.751c0 43.244 22.391 83.413 59.188 106.153 20.039 12.387 42.796 18.638 65.615 18.638 19.072 0 38.186-4.371 55.799-13.176l748.751-374.378c42.28-21.135 68.982-64.349 68.982-111.614 0-47.268-26.701-90.477-68.982-111.618l-748.751-374.378c-17.613-8.805-36.737-13.172-55.799-13.172v0z"></path>
									</svg>
								</span>
							</span>
						</button>
						<button class="StepBtn gray button-outline js-step" disabled>
							Step 
							<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
									 viewBox="0 0 1365 1024" 
									 class="icon" 
								>
								<path class="path1" d="M897.084 3.201h-193.227c-71.142 0-128.817 57.677-128.817 128.817v274.577l-379.405-252.939c-21.55-14.374-46.468-21.64-71.461-21.64-20.842 0-41.732 5.047-60.78 15.24-41.885 22.419-68.029 66.061-68.029 113.578v515.27c0 47.509 26.146 91.156 68.029 113.578 19.047 10.194 39.939 15.24 60.78 15.24 24.995 0 49.903-7.265 71.461-21.64l379.405-252.931v274.569c0 71.142 57.677 128.817 128.817 128.817h193.227c71.138 0 128.817-57.677 128.817-128.817v-772.904c0-71.142-57.682-128.817-128.817-128.817zM124.181 776.105v-515.27l386.455 257.633-386.455 257.633zM897.084 904.925h-193.227v-772.904h193.227v772.904z"></path>
							</svg>
						</button>
						<button class="RecBtn gray button-outline js-record">
							Rec 
							<i class="Icon-record"></i>
						</button>
						 &nbsp;&nbsp;
						<label>Speed</label> 
						<input type="range"
								min="-1"
								max="2"
						   	   step="0.01"
						  	  value="1"
						  	  class="range-dark js-speed">
						<input type="number"
								min="-1"
								max="2"
							   step="0.01"
							  value="1"
							  class="ControlBar-speed field-dark js-speed-display">
						<button class="ScreenBtn gray button-outline js-screencap">
							<svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
								 viewBox="0 0 1024 1024"
								 class = "icon"
							>
								<path class="path1" d="M959.884 128c0.040 0.034 0.082 0.076 0.116 0.116v767.77c-0.034 0.040-0.076 0.082-0.116 0.116h-895.77c-0.040-0.034-0.082-0.076-0.114-0.116v-767.772c0.034-0.040 0.076-0.082 0.114-0.114h895.77zM960 64h-896c-35.2 0-64 28.8-64 64v768c0 35.2 28.8 64 64 64h896c35.2 0 64-28.8 64-64v-768c0-35.2-28.8-64-64-64v0z"></path>
								<path class="path2" d="M832 288c0 53.020-42.98 96-96 96s-96-42.98-96-96 42.98-96 96-96 96 42.98 96 96z"></path>
								<path class="path3" d="M896 832h-768v-128l224-384 256 320h64l224-192z"></path>
							</svg>
						</button>
					</fieldset>
				</div>
			</div>`,

			render = that.render(template, wire);

		styles.insert(`
			
			.ControlBar{
				
			}

			.ControlBar-body{
				-webkit-transition: -webkit-transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    					transition:         transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
			}

			.ControlBar-body.is-hidden{
				-webkit-transform: translateY(100%);
						transform: translateY(100%);
			}

			.ControlBar-speed{
				max-width: 3rem;
			}

			.PlayPauseBtn{
		
			}

			.PlayPauseBtn-label{
				display: inline-block;
				position: relative;
			}

			.PlayPauseBtn *,
			.StepBtn *,
			.ScreenBtn *,
			.RecBtn *{
				pointer-events: none;
			}

			.PlayPauseBtn-playLabel{
				display: block;
				position: absolute;
					top: 0;
					left: 0;
				width: 100%;
			}

			.PlayPauseBtn.is-playing .PlayPauseBtn-playLabel{
				display: none;
			}

			.PlayPauseBtn-pauseLabel{
				position: relative;
				visibility: hidden;
			}

			.PlayPauseBtn.is-playing .PlayPauseBtn-pauseLabel{
				visibility: visible;
			}

			.Icon-record{
				display: inline-block;
				border: 2px solid #900;
				border-radius: 100%;
				width: 0.5em;
				height: 0.5em;
			}

			.Icon-record.is-recording{
				background-color: #900;
			}

		`)

		document.body.appendChild(render());

	}

}(window.ab = window.ab || {}, ab.component, ab.dynamicStyles));

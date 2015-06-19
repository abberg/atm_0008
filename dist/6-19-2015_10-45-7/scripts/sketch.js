(function(ab){
	"use strict";
	ab.sketch  = function(three){

		var scene = three.scene(),
			camera = three.camera(),
			renderer = three.renderer(),
			container,
			walk,
			model,
			previousModel,
			rotationVelocity = 0,
			t = 0,
			cameraTargetPosition = new THREE.Vector3(),
			cameraLookAt = new THREE.Vector3(),
			cameraLookAtTargetPosition = new THREE.Vector3(),
			tempPosition = new THREE.Vector3(),
			center = new THREE.Vector3(),
			radius = 0,
			orbit = false,

			init = function(){
				var geometry,
					material,
					mesh,
					randomColor,
					size1,
					size2,
					bbox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)),
					numBoxes = 0,
					direction = new THREE.Vector3(),
					directionalLight = new THREE.DirectionalLight( 0xffffff );

				container = new THREE.Object3D();
				walk = new THREE.Object3D();
				container.add(walk);
				scene.add( container );

				//for(var i = 0; i < 200; i++){
				var create = setInterval(function(){

					geometry = new THREE.BoxGeometry( Math.random() * 5 + 1, Math.random() * 5 + 1, Math.random() * 5 + 1 ),
					geometry.computeBoundingBox();

					material = new THREE.MeshLambertMaterial({color: 0x5c2d63, wrapAround:true});
					randomColor = Math.random();
					if( randomColor > 0.75 && randomColor < 0.95){
						material.color = new THREE.Color( 0xffffff );
					}else if( randomColor >= 0.95){
						material.color = new THREE.Color( 0xff0000 );
					}

					mesh = new THREE.Mesh( geometry, material );
					size1 = bbox.size();
					size2 = geometry.boundingBox.size();
					
					switch( Math.floor( Math.random() * 6 + 1) ){
						case 1:
							// top
							direction.set(0, ( size1.y / 2 ) + ( size2.y / 2 ), 0);
							break;
						case 2:
							// bottom
							direction.set(0, -( ( size1.y / 2 ) + ( size2.y / 2 ) ), 0);
							break;
						case 3:
							// left
							direction.set(-( ( size1.x / 2 ) + ( size2.x/ 2 ) ), 0, 0);
							break;
						case 4:
							// right
							direction.set(( size1.x / 2 ) + ( size2.x / 2 ), 0, 0);
							break;
						case 5:
							// front 
							direction.set(0, 0, ( size1.z / 2 ) + ( size2.z / 2 ) );
							break;
						case 6:
							// back
							direction.set(0, 0, -( ( size1.z / 2 ) + ( size2.z / 2 ) ) );
							break;
					};

					mesh.position.copy(bbox.center());
					mesh.position.add(direction);

					walk.add(mesh);

					bbox.setFromObject(walk);
					//walk.position.sub( bbox.center() );
					var offset = new THREE.Vector3(0, 0.5, 1).normalize().multiplyScalar(70);

					numBoxes++
					if(numBoxes === 500){
						clearInterval(create);
						//walk.position.sub( bbox.center() );
						cameraLookAtTargetPosition.copy(bbox.center());
						center.copy(bbox.center());
						orbit = true;
						radius = bbox.getBoundingSphere().radius * 1.5;
						// rotationVelocity = 0.0005;
					}else{
						
						offset.add(mesh.position);
						cameraLookAtTargetPosition.copy(mesh.position);
						cameraTargetPosition.copy(offset);
						bbox.setFromObject(mesh);						
					}


				}, 20);

				//bbox.setFromObject(walk);
				//walk.position.sub( bbox.center() );

				model = new THREE.Object3D();
				previousModel = model.clone();

				scene.add(directionalLight);
				directionalLight.position.set( 0, 1, 0.5 );

				renderer.setClearColor( 0x7b867e);

				//var offset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(bbox.getBoundingSphere().radius * 1.5 )
				//camera.position.add(offset);
				//camera.position.z = 50;
				//camera.lookAt(scene.position);
			},
			
			update = function(timestep){
				//var rotationVelocity = 0.0005;
				
				model.clone(previousModel);
				model.rotation.y += rotationVelocity * timestep;

				tempPosition.copy(cameraTargetPosition).sub(camera.position).multiplyScalar(0.005);
				camera.position.add(tempPosition);

				tempPosition.copy(cameraLookAtTargetPosition).sub(cameraLookAt).multiplyScalar(0.005);
				cameraLookAt.add(tempPosition);

				if(orbit){

					cameraTargetPosition.copy(center);

					cameraTargetPosition.x += radius * Math.sin(t);
					cameraTargetPosition.y += radius/3;
					cameraTargetPosition.z += radius * Math.cos(t);

					t += 0.01;
				}

			},
			
			draw = function(interpolation){
				camera.lookAt(cameraLookAt);	
				THREE.Quaternion.slerp ( previousModel.quaternion, model.quaternion, container.quaternion, interpolation )
				renderer.render(scene, camera);
			}

		return{
			init: init,
			update: update,
			draw: draw
		}
	}

}(window.ab = window.ab || {}))
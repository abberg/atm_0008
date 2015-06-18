(function(ab){
	"use strict";
	ab.sketch  = function(three){

		var scene = three.scene(),
			camera = three.camera(),
			renderer = three.renderer(),
			container,
			model,
			previousModel,

			init = function(){
				var geometry = new THREE.BoxGeometry( 1, 1, 1 ),
					material,
					mesh,
					previousPosition = new THREE.Vector3(),
					direction = new THREE.Vector3(),
					directionalLight = new THREE.DirectionalLight( 0xffffff );

				container = new THREE.Object3D();
				var walk = new THREE.Object3D();
				container.add(walk);
				scene.add( container );

				for(var i = 0; i < 500; i++){

					material = new THREE.MeshLambertMaterial({color: 0x5c2d63, wrapAround:true});
					var randomColor = Math.random();
					if( randomColor > 0.75 && randomColor < 0.95){
						material.color = new THREE.Color( 0xffffff );
					}else if( randomColor >= 0.95){
						material.color = new THREE.Color( 0xff0000 );
					}

					mesh = new THREE.Mesh( geometry, material );
					switch( Math.floor( Math.random() * 6 + 1) ){
						case 1:
							// top
							direction.set(0, 1, 0);
							break;
						case 2:
							// bottom
							direction.set(0, -1, 0);
							break;
						case 3:
							// left
							direction.set(-1, 0, 0);
							break;
						case 4:
							// right
							direction.set(1, 0, 0);
							break;
						case 5:
							// front 
							direction.set(0, 0, 1);
							break;
						case 6:
							// back
							direction.set(0, 0, -1);
							break;
					};
					previousPosition.add(direction);
					mesh.position.copy(previousPosition);
					walk.add(mesh);
				}

				var  bbox = new THREE.Box3();
				bbox.setFromObject(walk);
				walk.position.sub( bbox.center() );

				model = new THREE.Object3D();
				previousModel = model.clone();

				scene.add(directionalLight);
				directionalLight.position.set( 0, 1, 0.5 );

				renderer.setClearColor( 0x969b94);

				var offset = new THREE.Vector3(1, 0.5, 1).normalize().multiplyScalar(bbox.getBoundingSphere().radius * 1.25)
				camera.position.add(offset);
				camera.lookAt(scene.position);
			},
			
			update = function(timestep){
				var rotationVelocity = 0.0005;
				
				model.clone(previousModel);
				model.rotation.y += rotationVelocity * timestep;
			},
			
			draw = function(interpolation){
				renderer.render(scene, camera);
				THREE.Quaternion.slerp ( previousModel.quaternion, model.quaternion, container.quaternion, interpolation )
			}

		return{
			init: init,
			update: update,
			draw: draw
		}
	}

}(window.ab = window.ab || {}))
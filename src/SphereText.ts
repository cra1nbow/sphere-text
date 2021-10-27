import { LitElement, html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import {
  AmbientLight,
  Color,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SphereText extends LitElement {
  @property({ type: String }) text = 'LOVE';

  scene = new Scene();

  camera = new PerspectiveCamera();

  renderer = new WebGLRenderer();

  font: Font | null = null;

  textMesh: Mesh | null = null;

  spherePositions: Vector3[] = [];

  spheres: Mesh[] = [];

  constructor() {
    super();
    this.init();
    new FontLoader()
      .loadAsync('/fonts/Pretendard Light_Regular.json')
      .then(font => {
        this.font = font;
        this.updateText();
      });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._onChangeSize);
    this._onChangeSize();
    this._draw();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._onChangeSize);
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    this.updateText();
  }

  private _onChangeSize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  private _draw = () => {
    requestAnimationFrame(this._draw);

    this.spheres.forEach((mesh, index) => {
      mesh.position.lerp(this.spherePositions[index], 0.1);
    });

    this.renderer.render(this.scene, this.camera);
  };

  init = () => {
    this.camera.position.set(3, 5, 10);
    this.camera.lookAt(0, 0, 0);
    this.scene.background = new Color(0.83, 1, 0.4);

    const lights = [
      new PointLight(0xddffdd, 0.8),
      new PointLight(0xffdddd, 0.8),
      new PointLight(0xddddff, 0.8),
      new AmbientLight(0xffffff, 5e-1),
    ];

    lights[0].position.set(50, -50, -50);
    lights[1].position.set(50, -50, 50);
    lights[2].position.set(50, 50, -50);

    this.scene.add(...lights);
    const control = new OrbitControls(this.camera, this.renderer.domElement);
    control.update();
  };

  private updateText = () => {
    if (this.textMesh) {
      this.scene.remove(this.textMesh, ...this.spheres);
    }
    this.createText();
  };

  private createText = () => {
    if (!this.font) return;
    const textGeometry = new TextGeometry(this.text, {
      font: this.font,
      size: 3,
      height: 1,
      curveSegments: 4,
      bevelThickness: 2,
      bevelSize: 1.5,
    });
    textGeometry.computeBoundingBox();
    this.textMesh = new Mesh(textGeometry, new MeshStandardMaterial());
    const textMeshWidth =
      textGeometry.boundingBox!!.max.x - textGeometry.boundingBox!!.min.x;
    this.textMesh.position.x = -0.5 * textMeshWidth;

    const requiredSpheres = Math.ceil(textMeshWidth * 160);
    this.spheres = this.spheres.slice(0, requiredSpheres);
    this.spheres.push(
      ...[...Array(Math.max(requiredSpheres - this.spheres.length, 0))].map(
        this.createSphere,
      ),
    );

    this.spherePositions = this.spheres
      .map(() => {
        const sampler = new MeshSurfaceSampler(this.textMesh!!).build();
        const position = new Vector3();
        sampler.sample(position);
        position.setX(position.x - 0.5 * textMeshWidth);
        return position;
      })
      .sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));
    this.scene.add(...this.spheres);
  };

  private createSphere = () => {
    const material = new MeshStandardMaterial({ color: 0xffffff });
    material.color.setHSL(Math.random(), 1, 0.3);
    material.roughness = 0.5 * Math.random() + 0.5;

    return new Mesh(
      new SphereGeometry(8e-2 + Math.random() * 5e-4, 48, 24),
      material,
    );
  };

  render() {
    return html`<main>${this.renderer.domElement}</main>`;
  }
}

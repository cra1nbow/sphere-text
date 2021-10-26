import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export class SphereText extends LitElement {
  @property({ type: String }) text = 'love';

  scene = new Scene();

  camera = new PerspectiveCamera();

  renderer = new WebGLRenderer();

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._onChangeSize);
    this._onChangeSize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._onChangeSize);
  }

  _onChangeSize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  render() {
    return html`<main>${this.renderer.domElement}</main>`;
  }
}

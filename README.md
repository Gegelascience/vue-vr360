# vue-360vr

NgxView360 let you use 360 photo viewer in VR using VueJs technology.
This library adapt one of the samples from [WebXR Sample](https://github.com/immersive-web/webxr-samples).
A great thanks to *The Immersive Web Community Group*.

If VR is not supported, a magic window is enabled.


## Warnings

**You must use _https_ to display XR content. If you use _http_ you will only have cardboard display.**
[More informations](https://www.w3.org/TR/webxr/)

## Setup

### Installing

Install the package

````
npm i vue-360vr --save
````

### Using

In the parent component import the component:

````javascript
import Vr360 from "vue-360vr";

export default {
  name: "app",
  components: {
    Vr360
  }
};
````
Last but not least, in the template:

```
<Vr360  imgSrc="path/to/image" />
```

## API

The Vr360 component has some attributes to display the view.


Attributes | description
------------ | -------------
imgSrc | source of the image to display, need to be a equirectangular image (jpg or png accepted)
displayMode(optional) | Mode to display image ('mono', 'stereoTopBottom','stereoLeftRight'). 'mono' is the default mode.
customCanvasDimensions(optional) | object to customize canvas dimensions
showVRButton(optional) | boolean to show VR button (default value: true)


The property 'customCanvasDimensions' is Javascript object :

Attributes | Description
------------ | -------------
height(optional) | height of the canvas (vh).
width(optional) | width of the canvas (vw)



## LICENSE

MIT
# Pitbox Preview element

This is a web component intended to provide a dynamic "pitbox preview" image for Trading Paints liveries.

Livery painters often forget to change the pitbox colors on their liveries, so when you load into a race with a lot of custom liveries, it's a sea of red boxes with green canopies. This project is an example implementation of a way to generate preview images to show painters when a livery is uploaded. It's meant to be less of a useful preview image, and more of a "hey, did you remember to update the pitbox colors?"

This component uses a similar canvas color overlay approach that we use in the [Gabir Motors Spec Map Previsualization Tool](https://gabirmotors.com/tools/specmapping).

On the TP side, they would need to go through the iRacing templates and find the pixel coordinates for each car that determine the pitbox colors. Then, when a user is uploading a livery and selects a car, those pixels can be sampled to feed the colors into this web component.

I give Trading Paints permission to use the code for this web component (specifically `pitbox-preview.ts` or the compiled `pitbox-preview.js`, and the sample images in `assets`) in any way they see fit, without need for attribution. Use it, copy it, modify it, whatever.

This project was based on the `lit-starter-ts` template project from [the main Lit
repo](https://github.com/lit/lit).
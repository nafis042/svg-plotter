import { SVGNodeTransformer } from "../types";
import { createFeature, svgPointToCoordinate } from "../utils";
import Vector2 from "../Vector2";
import * as mathUtils from "../math-utils";

/**
 * Ellipse reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
 * Circle reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
 */
const ellipseTransformer: SVGNodeTransformer = (input, svgMeta, options) => {
    const center = new Vector2(
        parseFloat(input.attributes.cx),
        parseFloat(input.attributes.cy),
    );

    if (input.name === "circle" && input.attributes.fill === "#FCE72C") {
        // console.log("Debug: Converting to point");
        const point = svgPointToCoordinate(
            center,
            svgMeta,
            options,
            input.attributes.transform,
        );

        const id = input.attributes.id || null;
        // Extract seat information from attributes
        const properties = {
            section: input.attributes.section || null,
            row: input.attributes.row || null,
            seat: input.attributes.seat || null,
            class: "seat",
        };

        const geometry: GeoJSON.Point = {
            type: "Point",
            coordinates: point,
        };

        return {
            features: [createFeature(geometry, id, properties)],
            children: [],
        };
    }

    // console.log("Debug: Converting to polygon (default behavior)");
    // Original ellipse/circle to polygon conversion logic
    let rx = 0;
    let ry = 0;
    if (input.attributes.r) {
        rx = parseFloat(input.attributes.r);
        ry = rx;
    } else {
        rx = parseFloat(input.attributes.rx);
        ry = parseFloat(input.attributes.ry);
    }
    const points = mathUtils.drawCurve(
        (t: number) => mathUtils.pointOnEllipse(center, rx, ry, t),
        options.subdivideThreshold,
    ).map((p) => svgPointToCoordinate(
        p, svgMeta, options, input.attributes.transform,
    ));
    // Ensure first and last points are identical
    points[points.length - 1] = points[0];
    const id = options.idMapper ? options.idMapper(input) : null;
    const properties = options.propertyMapper
        ? options.propertyMapper(input)
        : null;
    const geometry: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [points],
    };
    return {
        features: [createFeature(geometry, id, properties)],
        children: [],
    };
};

export default ellipseTransformer;

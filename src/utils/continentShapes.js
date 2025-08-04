// utils/continentShapes.js

export const continentShapes = {
  Europe: {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        // rough shape covering Europe (includes western Russia up to Ural roughly)
        [
          [
            [-25.0, 34.0],
            [45.0, 34.0],
            [45.0, 72.0],
            [-10.0, 72.0],
            [-25.0, 55.0],
            [-15.0, 55.0],
            [-15.0, 48.0],
            [-25.0, 48.0],
            [-25.0, 34.0],
          ],
        ],
      ],
    },
  },
  Africa: {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-20.0, -35.0],
            [55.0, -35.0],
            [55.0, 38.0],
            [10.0, 38.0],
            [10.0, 15.0],
            [-10.0, 15.0],
            [-10.0, 5.0],
            [-20.0, 5.0],
            [-20.0, -35.0],
          ],
        ],
      ],
    },
  },
  Asia: {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [25.0, -10.0],
            [180.0, -10.0],
            [180.0, 80.0],
            [60.0, 80.0],
            [50.0, 60.0],
            [30.0, 60.0],
            [25.0, 30.0],
            [25.0, -10.0],
          ],
        ],
      ],
    },
  },
  "North America": {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-170.0, 15.0],
            [-50.0, 15.0],
            [-50.0, 75.0],
            [-170.0, 75.0],
            [-170.0, 15.0],
          ],
        ],
      ],
    },
  },
  "South America": {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-85.0, -60.0],
            [-30.0, -60.0],
            [-30.0, 15.0],
            [-85.0, 15.0],
            [-85.0, -60.0],
          ],
        ],
      ],
    },
  },
  Oceania: {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [110.0, -50.0],
            [180.0, -50.0],
            [180.0, 10.0],
            [140.0, 10.0],
            [110.0, -10.0],
            [110.0, -50.0],
          ],
        ],
      ],
    },
  },
  Antarctica: {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-180.0, -90.0],
            [180.0, -90.0],
            [180.0, -60.0],
            [-180.0, -60.0],
            [-180.0, -90.0],
          ],
        ],
      ],
    },
  },
};

import type { SVGConfig } from "@/types";

const DEFAULT_CONFIG: SVGConfig = {
  squareSize: 64,
  lightColor: "#EBECD0",
  darkColor: "#739552",
  selectedLightColor: "#B7C98D",
  selectedDarkColor: "#5D7A44",
  legalMoveDotColor: "rgba(0,0,0,0.18)",
  legalMoveCaptureColor: "rgba(0,0,0,0.25)",
  fileRankColor: "#4B4847",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

// ============================================================
// Chess piece SVG paths (viewBox 0 0 50 50)
// Each uses {g} as placeholder gradient ID (replaced at render)
// ============================================================

const PIECE_SVG: Record<string, string> = {
  K: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="M25.006 3.868c-1.803.1-3.228 1.234-3.228 2.618 0 .565.244 1.644.693 2.097h-5.766v5.106h6.306l-2.61 2.833 2.673 2.167c-5.584.362-12.02 1.643-13.154 3.997-1.268 2.638 6.215 15.6 6.215 15.6h17.73s7.484-12.963 6.215-15.6c-1.133-2.357-7.594-3.64-13.179-3.999l2.71-2.165-2.61-2.833h6.306V8.583H27.54c.449-.453.693-1.531.693-2.097 0-1.384-1.425-2.518-3.228-2.618z" style="paint-order:fill markers stroke"/><path d="m31.289 38.283 2.573-.005s7.482-12.428 6.214-15.065c-4.136-3.824-13.18-4.525-13.18-4.525 11.05 2.822 12.618 5.028 4.393 19.595z" opacity=".1"/><path fill="url({g})" stroke="#323232" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.242 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.749l.012-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685h-11.76z"/><g fill="#fff"><path d="M13.283 31.138s-3.074-6.555-2.666-8.092c.408-1.536 5.987-2.736 5.987-2.736-6.486 2.71-4.786 4.558-3.321 10.828zM17.521 12.884v-3.52l1.532-.011c-.891.007-1.532 2.147-1.532 3.531zM24.798 4.67s-2.614.92-1.53 3.522c-.178-.007-2.142-2.72 1.53-3.522z"/></g>`,
  Q: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="M25 6.122c-2.635 0-4.771 2.098-4.771 4.685.002 1.855 1.118 3.534 2.846 4.283-.369 2.286-1.51 7.558-4.68 8.009-2.355.334-3.855-1.287-4.88-3.144a4.19 4.19 0 0 0 1.767-3.4c0-2.327-1.921-4.214-4.291-4.214S6.699 14.228 6.7 16.555c0 2.142 1.64 3.943 3.809 4.183l4.973 17.54h19.036l4.973-17.54c2.169-.24 3.807-2.041 3.809-4.183 0-2.327-1.922-4.214-4.292-4.214s-4.29 1.887-4.29 4.214a4.19 4.19 0 0 0 1.766 3.4c-1.025 1.857-2.525 3.478-4.88 3.144-3.17-.45-4.31-5.723-4.68-8.01 1.729-.748 2.845-2.427 2.847-4.282 0-2.587-2.136-4.685-4.77-4.685z"/><path d="M39.002 12.342a4.348 4.348 0 0 0-1.567.296c4.741 1.678 3.877 6.805.591 7.316L30.414 38.28h4.2l4.87-17.541c2.17-.241 3.808-2.042 3.81-4.184 0-2.327-1.922-4.214-4.292-4.213z" opacity=".1"/><path fill="url({g})" stroke="#323232" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.227 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684H39.36l.013-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685h-11.76z"/><g fill="#fff"><path d="M9.515 13.489c-.794 1.17-1.726 2.667-1.554 4.779 0 0-1.604-3.01 1.554-4.779zM23.659 7.23c-.853.874-2.37 2.934-2.133 5.374-.207-.084-1.73-3.893 2.133-5.374zM12.062 23.328l5.244 14.111-1.17.023z"/></g>`,
  R: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="M12.855 10.383v7.663c0 3.268 6.53 3.774 6.53 3.774-.352 9.864-5.036 16.486-5.036 16.486l21.428-.039s-4.651-6.62-5-16.446c0 0 6.896-.507 6.896-3.774v-7.663h-4.72s.459 2.25-.47 3.26c-1.035 1.126-2.418 1.126-3.454 0-.928-1.01-.47-3.26-.47-3.26h-6.59s.459 2.25-.47 3.26c-1.122 1.22-2.699 1.22-3.82 0-.929-1.01-.47-3.26-.47-3.26z"/><path d="m37.543 10.462.014 7.585c.263 3.48-24.58 2.135-24.523 1.03 2.098 2.532 4.445 2.613 6.352 2.744 7.292.498 9.8 8.89 13.306 16.446h2.97s-4.65-6.62-5-16.446c2.547-.395 2.954-.812 4.037-1.058h.018l-.002-.004c1.023-.236 2.81-1.376 2.842-2.713v-7.663z" opacity=".1"/><path fill="url({g})" stroke="#323232" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.239 38.286c-1.437 0-2.627 1.216-2.627 2.685v.544l.013 2.685h28.75l.012-2.685v-.544c0-1.469-1.19-2.685-2.627-2.685H25z"/><g fill="#fff"><path d="M13.656 11.168v5.54c.48-1.867.299-4.088 1.554-5.54zM22.877 11.163c.055.896-.154 1.748-.269 2.616.48-1.866 1.823-2.616 1.823-2.616zM16.947 35.312c.875-1.143 3.603-10.333 3.233-13.244.7.39.658 10.057-3.233 13.244zM33.863 11.209c.005.598-.055 1.226-.187 2.02.48-1.867 1.295-2.04 1.295-2.04z"/></g>`,
  B: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="M26.87 8.223c-5.797-2.298-6.952 2.527-4.668 5.86-9.898 10.6-11.253 16.425-6.195 24.204h17.99c6.084-6.912 2.558-14.515-4.823-22.3-2.883 4.119-3.274 7.35-3.946 11.131l-3.62-.071c-.66-6.006 7.622-15.14 5.261-18.823z"/><path d="M24.933 7.654c-.625.02-.207.197-.771.567 0 .003.01.006.01.008 3.582-.311-2.369 11.772-3.394 18.894.536-3.014 1.325-5.68 3.082-8.725 2.003-4.351 4.237-8.681 3.008-10.169-.411-.38-1.144-.601-1.934-.575zm4.24 8.338c-.6.856-.517.67-.972 1.462 6.004 6.049 8.728 13.787 3.097 20.838h2.696c6.085-6.912 2.56-14.515-4.822-22.3z" opacity=".1"/><path fill="url({g})" stroke="#323232" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.24 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.749l.012-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685H25z"/><path fill="#fff" d="M14.895 34.327c-.716-1.396-3.266-6.812 4.513-15.739-2.1 4.86-5.958 8.69-4.513 15.739z"/>`,
  N: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="m25.987 23.546-11.592 1.097-1.454-5.216 14.468-6.815 1.763-3.9 10.2 11.892-4.116 17.678H14.74c.245-11.292 9.64-8.1 11.247-14.736z"/><path d="m29.173 8.72-.879 1.945.426-.943c2.692 3.722 5.608 7.279 8.45 10.888l-5.285 17.671h3.372l4.117-17.671z" opacity=".1"/><path fill="url({g})" stroke="#323232" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.24 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.748l.013-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685H25z"/><path fill="#fff" d="M15.62 37.633c.159-4.472 2.145-6.971 8.667-9.837-.987 1.107-6.405 2.237-8.667 9.837zM14.418 21.67l-.523-1.803L28.03 13.21l1.217-2.764-.671 3.558-14.35 5.921z"/>`,
  P: `<path fill="url({g})" stroke="#323232" stroke-linejoin="round" stroke-width="1.6" d="M25 12.264c-3.56 0-6.447 2.655-6.447 5.93 0 1.705.799 3.326 2.19 4.45h-1.666c-1.312 0-2.4.978-2.4 2.158v.438c0 1.18 1.088 2.157 2.4 2.157h2.376c0 7.293-9.342 6.457-8.689 16.78L25 44.167l12.236.008c.653-10.323-8.689-9.486-8.689-16.779h2.376c1.312 0 2.4-.978 2.4-2.157v-.438c0-1.18-1.087-2.157-2.4-2.157h-1.666c1.391-1.125 2.19-2.747 2.19-4.45 0-3.276-2.886-5.93-6.446-5.931z"/><path d="M24.999 12.264c-.521 0-1.028.058-1.513.166 6.257.692 7.675 6.466 4.917 9.222-2.016 1.69-7.662.993-7.662.993 2.56.443 4.97 1.954 7.252 2.488-6.033 11.435 9.7 9.026 9.242 19.043.995-10.592-7.673-8.148-8.689-16.78h2.377c1.312 0 2.398-.977 2.398-2.156v-.438c0-1.18-1.086-2.158-2.398-2.158h-1.667c1.391-1.125 2.191-2.746 2.19-4.449 0-3.276-2.886-5.932-6.447-5.932z" opacity=".15"/><path fill="#fff" d="M22.959 13.401c-1.77 1.602-2.968 3.612-3.476 6.19 0 0-1.16-4.235 3.476-6.19zM13.342 43.419c.273-5.321 2.572-6.184 7.538-11.434-1.03 3.566-7.387 5.868-7.538 11.434z"/>`,
  k: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="M25.006 3.868c-1.803.1-3.228 1.234-3.228 2.618 0 .565.244 1.644.693 2.097h-5.766v5.106h6.306l-2.61 2.833 2.673 2.167c-5.584.362-12.02 1.643-13.154 3.997-1.268 2.638 6.215 15.6 6.215 15.6h17.73s7.484-12.963 6.215-15.6c-1.133-2.357-7.594-3.64-13.179-3.999l2.71-2.165-2.61-2.833h6.306V8.583H27.54c.449-.453.693-1.531.693-2.097 0-1.384-1.425-2.518-3.228-2.618z" style="paint-order:fill markers stroke"/><path d="m31.289 38.283 2.573-.005s7.482-12.428 6.214-15.065c-4.136-3.824-13.18-4.525-13.18-4.525 11.05 2.822 12.618 5.028 4.393 19.595z" opacity=".15"/><path fill="url({g})" stroke="#1e1e1e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.242 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.749l.012-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685h-11.76z"/><g fill="#fff"><path d="M13.283 31.138s-3.074-6.555-2.666-8.092c.408-1.536 5.987-2.736 5.987-2.736-6.486 2.71-4.786 4.558-3.321 10.828zM17.521 12.884v-3.52l1.532-.011c-.891.007-1.532 2.147-1.532 3.531zM24.798 4.67s-2.614.92-1.53 3.522c-.178-.007-2.142-2.72 1.53-3.522z" opacity=".25"/></g>`,
  q: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="M25 6.122c-2.635 0-4.771 2.098-4.771 4.685.002 1.855 1.118 3.534 2.846 4.283-.369 2.286-1.51 7.558-4.68 8.009-2.355.334-3.855-1.287-4.88-3.144a4.19 4.19 0 0 0 1.767-3.4c0-2.327-1.921-4.214-4.291-4.214S6.699 14.228 6.7 16.555c0 2.142 1.64 3.943 3.809 4.183l4.973 17.54h19.036l4.973-17.54c2.169-.24 3.807-2.041 3.809-4.183 0-2.327-1.922-4.214-4.292-4.214s-4.29 1.887-4.29 4.214a4.19 4.19 0 0 0 1.766 3.4c-1.025 1.857-2.525 3.478-4.88 3.144-3.17-.45-4.31-5.723-4.68-8.01 1.729-.748 2.845-2.427 2.847-4.282 0-2.587-2.136-4.685-4.77-4.685z"/><path d="M39.002 12.342a4.348 4.348 0 0 0-1.567.296c4.741 1.678 3.877 6.805.591 7.316L30.414 38.28h4.2l4.87-17.541c2.17-.241 3.808-2.042 3.81-4.184 0-2.327-1.922-4.214-4.292-4.213z" opacity=".15"/><path fill="url({g})" stroke="#1e1e1e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.227 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684H39.36l.013-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685h-11.76z"/><g fill="#fff"><path d="M9.515 13.489c-.794 1.17-1.726 2.667-1.554 4.779 0 0-1.604-3.01 1.554-4.779zM23.659 7.23c-.853.874-2.37 2.934-2.133 5.374-.207-.084-1.73-3.893 2.133-5.374zM12.062 23.328l5.244 14.111-1.17.023z" opacity=".25"/></g>`,
  r: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="M12.855 10.383v7.663c0 3.268 6.53 3.774 6.53 3.774-.352 9.864-5.036 16.486-5.036 16.486l21.428-.039s-4.651-6.62-5-16.446c0 0 6.896-.507 6.896-3.774v-7.663h-4.72s.459 2.25-.47 3.26c-1.035 1.126-2.418 1.126-3.454 0-.928-1.01-.47-3.26-.47-3.26h-6.59s.459 2.25-.47 3.26c-1.122 1.22-2.699 1.22-3.82 0-.929-1.01-.47-3.26-.47-3.26z"/><path d="m37.543 10.462.014 7.585c.263 3.48-24.58 2.135-24.523 1.03 2.098 2.532 4.445 2.613 6.352 2.744 7.292.498 9.8 8.89 13.306 16.446h2.97s-4.65-6.62-5-16.446c2.547-.395 2.954-.812 4.037-1.058h.018l-.002-.004c1.023-.236 2.81-1.376 2.842-2.713v-7.663z" opacity=".15"/><path fill="url({g})" stroke="#1e1e1e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.239 38.286c-1.437 0-2.627 1.216-2.627 2.685v.544l.013 2.685h28.75l.012-2.685v-.544c0-1.469-1.19-2.685-2.627-2.685H25z"/><g fill="#fff"><path d="M13.656 11.168v5.54c.48-1.867.299-4.088 1.554-5.54zM22.877 11.163c.055.896-.154 1.748-.269 2.616.48-1.866 1.823-2.616 1.823-2.616zM16.947 35.312c.875-1.143 3.603-10.333 3.233-13.244.7.39.658 10.057-3.233 13.244zM33.863 11.209c.005.598-.055 1.226-.187 2.02.48-1.867 1.295-2.04 1.295-2.04z" opacity=".25"/></g>`,
  b: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="M26.87 8.223c-5.797-2.298-6.952 2.527-4.668 5.86-9.898 10.6-11.253 16.425-6.195 24.204h17.99c6.084-6.912 2.558-14.515-4.823-22.3-2.883 4.119-3.274 7.35-3.946 11.131l-3.62-.071c-.66-6.006 7.622-15.14 5.261-18.823z"/><path d="M24.933 7.654c-.625.02-.207.197-.771.567 0 .003.01.006.01.008 3.582-.311-2.369 11.772-3.394 18.894.536-3.014 1.325-5.68 3.082-8.725 2.003-4.351 4.237-8.681 3.008-10.169-.411-.38-1.144-.601-1.934-.575zm4.24 8.338c-.6.856-.517.67-.972 1.462 6.004 6.049 8.728 13.787 3.097 20.838h2.696c6.085-6.912 2.56-14.515-4.822-22.3z" opacity=".15"/><path fill="url({g})" stroke="#1e1e1e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.24 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.749l.012-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685H25z"/><path fill="#fff" d="M14.895 34.327c-.716-1.396-3.266-6.812 4.513-15.739-2.1 4.86-5.958 8.69-4.513 15.739z" opacity=".25"/>`,
  n: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="m25.987 23.546-11.592 1.097-1.454-5.216 14.468-6.815 1.763-3.9 10.2 11.892-4.116 17.678H14.74c.245-11.292 9.64-8.1 11.247-14.736z"/><path d="m29.173 8.72-.879 1.945.426-.943c2.692 3.722 5.608 7.279 8.45 10.888l-5.285 17.671h3.372l4.117-17.671z" opacity=".15"/><path fill="url({g})" stroke="#1e1e1e" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M13.24 38.286c-1.437 0-2.627 1.216-2.627 2.685v.545l.013 2.684h28.748l.013-2.684v-.545c0-1.468-1.19-2.685-2.627-2.685H25z"/><path fill="#fff" d="M15.62 37.633c.159-4.472 2.145-6.971 8.667-9.837-.987 1.107-6.405 2.237-8.667 9.837zM14.418 21.67l-.523-1.803L28.03 13.21l1.217-2.764-.671 3.558-14.35 5.921z" opacity=".25"/>`,
  p: `<path fill="url({g})" stroke="#1e1e1e" stroke-linejoin="round" stroke-width="1.6" d="M25 12.264c-3.56 0-6.447 2.655-6.447 5.93 0 1.705.799 3.326 2.19 4.45h-1.666c-1.312 0-2.4.978-2.4 2.158v.438c0 1.18 1.088 2.157 2.4 2.157h2.376c0 7.293-9.342 6.457-8.689 16.78L25 44.167l12.236.008c.653-10.323-8.689-9.486-8.689-16.779h2.376c1.312 0 2.4-.978 2.4-2.157v-.438c0-1.18-1.087-2.157-2.4-2.157h-1.666c1.391-1.125 2.19-2.747 2.19-4.45 0-3.276-2.886-5.93-6.446-5.931z"/><path d="M24.999 12.264c-.521 0-1.028.058-1.513.166 6.257.692 7.675 6.466 4.917 9.222-2.016 1.69-7.662.993-7.662.993 2.56.443 4.97 1.954 7.252 2.488-6.033 11.435 9.7 9.026 9.242 19.043.995-10.592-7.673-8.148-8.689-16.78h2.377c1.312 0 2.398-.977 2.398-2.156v-.438c0-1.18-1.086-2.158-2.398-2.158h-1.667c1.391-1.125 2.191-2.746 2.19-4.449 0-3.276-2.886-5.932-6.447-5.932z" opacity=".15"/><path fill="#fff" d="M22.959 13.401c-1.77 1.602-2.968 3.612-3.476 6.19 0 0-1.16-4.235 3.476-6.19zM13.342 43.419c.273-5.321 2.572-6.184 7.538-11.434-1.03 3.566-7.387 5.868-7.538 11.434z" opacity=".25"/>`,
};

interface RenderSVGOptions {
  board: string[][];
  turn: "w" | "b";
  gameId: string;
  selectedSquare: string | null;
  legalMoves: string[];
  isPlayerTurn: boolean;
  baseUrl: string;
  config?: Partial<SVGConfig>;
  statusText?: string;
  whitePlayer?: string;
  blackPlayer?: string;
}

function squareToColor(
  row: number,
  col: number,
  selectedSquare: string | null,
  config: SVGConfig,
): string {
  const file = FILES[col];
  const rank = 8 - row;
  const square = `${file}${rank}`;
  const isLight = (row + col) % 2 === 0;

  if (selectedSquare === square) {
    return isLight ? config.selectedLightColor : config.selectedDarkColor;
  }
  return isLight ? config.lightColor : config.darkColor;
}

function sanitizeUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderChessSVG(options: RenderSVGOptions): string {
  const config: SVGConfig = { ...DEFAULT_CONFIG, ...options.config };
  const {
    board,
    gameId,
    selectedSquare,
    legalMoves,
    isPlayerTurn,
    baseUrl,
    statusText,
    whitePlayer,
    blackPlayer,
  } = options;

  const SQS = config.squareSize;
  const BOARD_SIZE = SQS * 8;
  const PADDING = 28;
  const TOTAL_WIDTH = BOARD_SIZE + PADDING * 2;
  const TOTAL_HEIGHT = BOARD_SIZE + PADDING * 2;
  const boardOffsetX = PADDING;
  const boardOffsetY = PADDING;

  const lines: string[] = [];
  const push = (s: string) => lines.push(s);

  push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}" width="${TOTAL_WIDTH}" height="${TOTAL_HEIGHT}">`,
  );

  // Shared gradients for pieces
  push(`<defs>
    <linearGradient id="wg">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#bba38a"/>
    </linearGradient>
    <linearGradient id="bg">
      <stop offset="0" stop-color="#796c60"/>
      <stop offset="1" stop-color="#4b403b"/>
    </linearGradient>
    <style>
      .label { font-family: '-apple-system', sans-serif; font-size: 10px; fill: ${config.fileRankColor}; text-anchor: middle; dominant-baseline: central; font-weight: 600; }
      .turn-indicator { font-family: '-apple-system', sans-serif; font-size: 11px; fill: rgba(255,255,255,0.72); }
    </style>
  </defs>`);

  // Draw squares
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const x = boardOffsetX + col * SQS;
      const y = boardOffsetY + row * SQS;
      const color = squareToColor(row, col, selectedSquare, config);
      const file = FILES[col];
      const rank = 8 - row;
      const square = `${file}${rank}`;

      push(
        `<rect x="${x}" y="${y}" width="${SQS}" height="${SQS}" fill="${color}" rx="2" />`,
      );

      // Legal move indicators
      if (legalMoves.includes(square)) {
        const piece = board[row][col];
        if (piece) {
          push(
            `<rect x="${x + 3}" y="${y + 3}" width="${SQS - 6}" height="${SQS - 6}" fill="none" stroke="${config.legalMoveCaptureColor}" stroke-width="3" rx="4" />`,
          );
        } else {
          push(
            `<circle cx="${x + SQS / 2}" cy="${y + SQS / 2}" r="7" fill="${config.legalMoveDotColor}" />`,
          );
        }
      }

      // Piece SVG
      const pieceChar = board[row][col];
      if (pieceChar) {
        const svgContent = PIECE_SVG[pieceChar];
        if (svgContent) {
          const gradientId =
            pieceChar === pieceChar.toUpperCase() ? "wg" : "bg";
          const processed = svgContent.replace(/\{g\}/g, gradientId);
          const scale = SQS / 50;
          push(
            `<g transform="translate(${x}, ${y}) scale(${scale})">${processed}</g>`,
          );
        }
      }

      // Clickable link overlay
      if (isPlayerTurn) {
        const linkUrl = `${baseUrl}/api/move?gameId=${gameId}&square=${square}`;
        push(`<a xlink:href="${sanitizeUrl(linkUrl)}" target="_top">
          <rect x="${x}" y="${y}" width="${SQS}" height="${SQS}" fill="transparent" />
        </a>`);
      }
    }
  }

  // File labels (a-h) at bottom
  for (let col = 0; col < 8; col++) {
    const x = boardOffsetX + col * SQS + SQS / 2;
    const y = boardOffsetY + 8 * SQS + 16;
    push(`<text x="${x}" y="${y}" class="label">${FILES[col]}</text>`);
  }

  // Rank labels (1-8) on left
  for (let row = 0; row < 8; row++) {
    const x = boardOffsetX - 12;
    const y = boardOffsetY + row * SQS + SQS / 2;
    push(`<text x="${x}" y="${y}" class="label">${8 - row}</text>`);
  }

  // Status / info bar at top
  if (statusText || whitePlayer || blackPlayer) {
    const infoY = 12;
    const infoParts: string[] = [];
    if (whitePlayer) infoParts.push(`\u2654 ${whitePlayer}`);
    if (blackPlayer) infoParts.push(`\u265A ${blackPlayer}`);
    if (statusText) infoParts.push(statusText);
    const infoText = infoParts.join("  |  ");
    push(
      `<text x="${TOTAL_WIDTH / 2}" y="${infoY}" class="turn-indicator" font-size="10">${infoText}</text>`,
    );
  }

  push("</svg>");
  return lines.join("\n");
}

export interface GameSetItem {
  board: string[][];
  turn: "w" | "b";
  gameId: string;
  selectedSquare: string | null;
  legalMoves: string[];
  status: string;
  whitePlayer: string;
  blackPlayer: string;
}

export function renderGameSetSVG(
  games: GameSetItem[],
  options: { baseUrl: string; config?: Partial<SVGConfig> },
): string {
  const config: SVGConfig = { ...DEFAULT_CONFIG, ...options.config };
  const SQS = config.squareSize;
  const BOARD_SIZE = SQS * 8;
  const PADDING = 28;
  const BOARD_TOTAL = BOARD_SIZE + PADDING * 2;
  const LABEL_SPACE = 24;
  const GAP = 20;
  const TOTAL_WIDTH = BOARD_TOTAL;

  const totalHeight =
    games.length * (BOARD_TOTAL + LABEL_SPACE) + (games.length - 1) * GAP;

  const lines: string[] = [];
  const push = (s: string) => lines.push(s);

  push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${TOTAL_WIDTH} ${totalHeight}" width="${TOTAL_WIDTH}" height="${totalHeight}">`,
  );

  push(`<defs>
    <linearGradient id="wg">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#bba38a"/>
    </linearGradient>
    <linearGradient id="bg">
      <stop offset="0" stop-color="#796c60"/>
      <stop offset="1" stop-color="#4b403b"/>
    </linearGradient>
    <style>
      .label { font-family: '-apple-system', sans-serif; font-size: 10px; fill: ${config.fileRankColor}; text-anchor: middle; dominant-baseline: central; font-weight: 600; }
      .turn-indicator { font-family: '-apple-system', sans-serif; font-size: 11px; fill: rgba(255,255,255,0.72); }
      .vs-text { font-family: '-apple-system', sans-serif; font-size: 13px; fill: rgba(255,255,255,0.85); text-anchor: middle; font-weight: 600; }
    </style>
  </defs>`);

  let currentY = 0;

  for (const game of games) {
    const {
      board,
      turn,
      gameId,
      selectedSquare,
      legalMoves,
      status,
      whitePlayer,
      blackPlayer,
    } = game;
    const isPlayerTurn = status === "active";

    push(`<g transform="translate(0, ${currentY})">`);

    const boardOffsetX = PADDING;
    const boardOffsetY = PADDING;

    // Draw squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = boardOffsetX + col * SQS;
        const y = boardOffsetY + row * SQS;
        const color = squareToColor(row, col, selectedSquare, config);
        const file = FILES[col];
        const rank = 8 - row;
        const sq = `${file}${rank}`;

        push(
          `<rect x="${x}" y="${y}" width="${SQS}" height="${SQS}" fill="${color}" rx="2" />`,
        );

        // Legal move indicators
        if (legalMoves.includes(sq)) {
          const piece = board[row][col];
          if (piece) {
            push(
              `<rect x="${x + 3}" y="${y + 3}" width="${SQS - 6}" height="${SQS - 6}" fill="none" stroke="${config.legalMoveCaptureColor}" stroke-width="3" rx="4" />`,
            );
          } else {
            push(
              `<circle cx="${x + SQS / 2}" cy="${y + SQS / 2}" r="7" fill="${config.legalMoveDotColor}" />`,
            );
          }
        }

        // Piece SVG
        const pieceChar = board[row][col];
        if (pieceChar) {
          const svgContent = PIECE_SVG[pieceChar];
          if (svgContent) {
            const gradientId =
              pieceChar === pieceChar.toUpperCase() ? "wg" : "bg";
            const processed = svgContent.replace(/\{g\}/g, gradientId);
            const scale = SQS / 50;
            push(
              `<g transform="translate(${x}, ${y}) scale(${scale})">${processed}</g>`,
            );
          }
        }

        // Clickable link overlay
        if (isPlayerTurn && gameId) {
          const linkUrl = `${options.baseUrl}/api/move?gameId=${gameId}&square=${sq}`;
          push(`<a xlink:href="${sanitizeUrl(linkUrl)}" target="_top">
          <rect x="${x}" y="${y}" width="${SQS}" height="${SQS}" fill="transparent" />
        </a>`);
        }
      }
    }

    // File labels (a-h) at bottom
    for (let col = 0; col < 8; col++) {
      const x = boardOffsetX + col * SQS + SQS / 2;
      const y = boardOffsetY + 8 * SQS + 16;
      push(`<text x="${x}" y="${y}" class="label">${FILES[col]}</text>`);
    }

    // Rank labels (1-8) on left
    for (let row = 0; row < 8; row++) {
      const x = boardOffsetX - 12;
      const y = boardOffsetY + row * SQS + SQS / 2;
      push(`<text x="${x}" y="${y}" class="label">${8 - row}</text>`);
    }

    // Info bar at top
    const infoParts: string[] = [];
    if (whitePlayer) infoParts.push(`\u2654 ${whitePlayer}`);
    if (blackPlayer) infoParts.push(`\u265A ${blackPlayer}`);
    if (status !== "active") {
      infoParts.push(status);
    } else {
      infoParts.push(`Turno: ${turn === "w" ? "Blancas" : "Negras"}`);
    }
    const infoText = infoParts.join("  |  ");
    push(
      `<text x="${TOTAL_WIDTH / 2}" y="12" class="turn-indicator" font-size="10">${infoText}</text>`,
    );

    // "vs Opponent" label below the board
    const vsY = BOARD_TOTAL + 8;
    const vsLabel = blackPlayer
      ? `${whitePlayer || "Blancas"} vs ${blackPlayer}`
      : `${whitePlayer || "Blancas"} vs Esperando...`;
    push(
      `<text x="${TOTAL_WIDTH / 2}" y="${vsY}" class="vs-text">${vsLabel}</text>`,
    );

    push(`</g>`);

    currentY += BOARD_TOTAL + LABEL_SPACE + GAP;
  }

  push("</svg>");
  return lines.join("\n");
}

export function renderEmptySVG(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 60" width="480" height="60">
    <style>
      text { font-family: '-apple-system', sans-serif; font-size: 14px; fill: rgba(255,255,255,0.72); text-anchor: middle; dominant-baseline: central; }
    </style>
    <rect width="480" height="60" fill="#262421" rx="8" />
    <text x="240" y="30">${message}</text>
  </svg>`;
}

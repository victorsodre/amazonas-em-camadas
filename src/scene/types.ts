import type * as T from 'three';
import type { catalog } from '../content/catalog.ts';
export type Mode='section'|'pores';
export type Part=(typeof catalog)[number]&{group:T.Group};
export type ViewState={water:number;separation:number;mode:Mode;poreWater:boolean;selected:string|null;isolated:boolean;wireframe:boolean};
export type SceneHandle={parts:Part[];update:(state:ViewState)=>void;home:()=>void;focus:(id:string)=>void;zoom:(factor:number)=>void;capture:(portrait?:boolean)=>void;dispose:()=>void};

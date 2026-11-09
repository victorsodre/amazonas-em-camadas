import type * as T from 'three';
import type { catalog, PartId } from '../content/catalog.ts';
export type Mode='section'|'pores';
export type Part=(typeof catalog)[number]&{group:T.Group};
export type ViewState={water:number;separation:number;mode:Mode;poreWater:boolean;selected:PartId|null;isolated:boolean;wireframe:boolean};
export type SceneHandle={update:(state:ViewState)=>void;home:()=>void;focus:(id:PartId)=>void;zoom:(factor:number)=>void;capture:(portrait?:boolean)=>void;dispose:()=>void};

export interface Spell {
  index: string;
  name: string;
  level: number;
  url: string;
}

export interface GrimoireSpell {
  index: string;
  name: string;
  desc: string[];
  higher_level: string[];
  range: string;
  components: string[];
  material: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  heal_at_slot_level: any;
  school: any;
  classes: any;
  subclasses: any;
  url: string;
  updated_at: string;
}

export interface Spell {
  index: string;
  name: string;
  level: number;
  url: string;
}

interface School {
  name: string;
  url: string;
}

interface Class {
  name: string;
  url: string;
}

export interface GrimoireSpell {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  heal_at_slot_level?: Record<string, number>;
  school?: School;
  classes?: Class[];
  subclasses?: Class[];
  url: string;
  updated_at?: string;
}

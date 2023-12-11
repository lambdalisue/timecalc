type Time = { h: number; m: number };

type Operator = (t1: Time, t2: Time) => Time;

const operators = {
  "+": (t1: Time, t2: Time) => norm({ h: t1.h + t2.h, m: t1.m + t2.m }),
  "-": (t1: Time, t2: Time) => norm({ h: t1.h - t2.h, m: t1.m - t2.m }),
};

function norm(t: Time): Time {
  const mh = Math.floor(t.m / 60);
  const mm = t.m % 60;
  return {
    h: t.h + mh,
    m: mm < 0 ? 60 + mm : mm,
  };
}

function parse(t: string): Time {
  const m = /(-?\d+):(\d+)/.exec(t);
  if (!m) {
    throw new Error("t must be '(hours):(minutes)'");
  }
  return norm({ h: Number(m[1]), m: Number(m[2]) });
}

function format(t: Time): string {
  return [t.h.toString(), t.m.toString().padStart(2, "0")].join(":");
}

function parseExpr(expr: string): readonly [Time, Time, Operator, string] {
  const m = /(-?\d+:\d+)\s*([+-])\s*(-?\d+:\d+)/.exec(expr);
  if (!m) {
    throw new Error(`Invalid expression: ${expr}`);
  }
  const t1 = parse(m[1]);
  const t2 = parse(m[3]);
  const op = operators[m[2] as keyof typeof operators];
  return [t1, t2, op, m[2]];
}

document.addEventListener("DOMContentLoaded", () => {
  const expr = document.querySelector<HTMLInputElement>("#expr")!;
  const view = document.querySelector<HTMLPreElement>("#result")!;

  expr.addEventListener("keyup", (event) => {
    // https://developer.mozilla.org/ja/docs/Web/API/Element/keyup_event
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.code !== "Enter") {
      return;
    }
    const [t1, t2, opFunc, opSymbol] = parseExpr(expr.value);
    const t3 = opFunc(t1, t2);
    const record = `${format(t1)} ${opSymbol} ${format(t2)} = ${format(t3)}`;
    view.innerHTML = `${record}\n${view.innerHTML}`;
  });
});

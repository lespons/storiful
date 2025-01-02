'use client';
import { useEffect, useRef } from 'react';
import { addDays, differenceInDays, format, isSameDay, startOfDay, subDays } from 'date-fns';

class GanttChartCanvas {
  private days: Date[];
  private stateDates: { [timespan: string]: boolean };
  private items: GanttChartProps['items'];
  private readonly headerHeight: number;
  private readonly barYOffset: number;
  private readonly rowHeight: number;
  private readonly dayWidth: number;

  constructor() {
    this.days = [];
    this.items = [];

    this.stateDates = {};
    this.headerHeight = 30;
    this.barYOffset = 10;
    this.rowHeight = 35;
    this.dayWidth = 15;
  }

  initData(items: GanttChartProps['items']) {
    const days = [];

    const allDates = items
      .map(({ states }) =>
        states
          .map((s) => {
            const markerDates =
              s.markers?.map(({ date }) => date.getTime()).filter((date) => date <= Date.now()) ??
              [];
            return s.end?.getDate()
              ? [s.start.getTime(), s.end.getTime(), ...markerDates]
              : [s.start.getTime(), ...markerDates];
          })
          .flat()
      )
      .flat();
    const startDate = subDays(Math.min(...allDates), 3);
    const endDate = addDays(Math.max(...allDates), 3);
    let currentDate = startOfDay(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.days = days;
    this.stateDates = allDates.reduce(
      (result, curr) => {
        result[startOfDay(curr).valueOf().toString()] = true;
        return result;
      },
      {} as { [timespan: string]: boolean }
    );
    this.items = items;
  }

  public render = (canvas: HTMLCanvasElement, dpr: number) => {
    const canvasWidth = this.days.length * this.dayWidth * dpr;
    const rect = canvas.getBoundingClientRect();

    canvas.width = canvasWidth;
    canvas.height = rect.height * dpr;

    canvas.style.height = `${this.items.length * this.rowHeight + 50}px`;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    this.drawChart(ctx, canvas.width, canvas.height);
  };

  private drawChart(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.drawDays(ctx, height);
    this.drawStates(ctx);
  }

  private drawDays(ctx: CanvasRenderingContext2D, height: number) {
    ctx.save();

    ctx.font = `${12}px sans-serif`;
    ctx.setLineDash([2]);

    this.days.forEach((day: Date, index) => {
      const x = index * this.dayWidth;
      if (day.getDate() === 1) {
        ctx.fillText(format(day, 'MMM'), x, this.headerHeight - 20);
      }

      if (!this.stateDates[day.getTime().toString()]) {
        return;
      }

      const dayString = day.getDate().toString();
      const { width: textWidth } = ctx.measureText(dayString);
      ctx.fillText(dayString, x - textWidth / 2, this.headerHeight - 5);
      ctx.beginPath();
      ctx.moveTo(x, this.headerHeight);
      ctx.lineTo(x, height);
      ctx.strokeStyle = 'blue';
      ctx.stroke();
    });

    ctx.restore();
  }

  private drawStates(ctx: CanvasRenderingContext2D) {
    this.items.forEach((item, stateIndex) => {
      const y = this.headerHeight + stateIndex * this.rowHeight;

      let lastStartIndex = 0;
      for (let stateIndex = item.states.length - 1; stateIndex >= 0; stateIndex--) {
        const state = item.states[stateIndex];

        const startIndex = this.days.findIndex((d) => isSameDay(d, state.start));

        lastStartIndex = startIndex;
        const diffInDays = differenceInDays(
          state.end ?? addDays(this.days[this.days.length - 1], 1),
          state.start
        );

        const blockLeftOffset = startIndex * this.dayWidth;

        const width = (diffInDays || 0.5) * this.dayWidth;

        ctx.fillStyle = state.color ?? '#fff';
        ctx.strokeStyle = 'black';
        ctx.fillRect(blockLeftOffset, y + this.barYOffset, width, this.rowHeight - this.barYOffset);

        if (state.strike) {
          ctx.setLineDash([6]);
          ctx.strokeRect(
            blockLeftOffset,
            y + this.barYOffset,
            width,
            this.rowHeight - this.barYOffset
          );
        }

        if (state.markers) {
          state.markers.forEach(({ date, color, width }) => {
            const markerIndex = this.days.findIndex((d) => isSameDay(d, date));

            ctx.fillStyle = color;
            ctx.fillRect(
              markerIndex * this.dayWidth,
              y + this.barYOffset,
              width,
              this.rowHeight - this.barYOffset
            );
          });
        }
      }

      this.drawStateId(ctx, item, lastStartIndex, y);
    });
  }

  private drawStateId(
    ctx: CanvasRenderingContext2D,
    item: {
      id: string;
      states: {
        start: Date;
        end?: Date;
        color?: string;
        strike?: 'dashed';
        markers?: { date: Date; color: string; width: number }[];
      }[];
    },
    lastStartIndex: number,
    y: number
  ) {
    ctx.save();
    const fontSize = 17;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'black';
    const { width: textWidth } = ctx.measureText(item.id);
    ctx.fillRect(this.dayWidth * lastStartIndex + 10, y + this.barYOffset, textWidth, fontSize + 2);
    ctx.fillStyle = '#fff';
    ctx.fillText(item.id, this.dayWidth * lastStartIndex + 10, y + this.barYOffset + fontSize);
    ctx.restore();
  }
}

interface GanttChartProps {
  items: {
    id: string;
    states: {
      start: Date;
      end?: Date;
      color?: string;
      strike?: 'dashed';
      markers?: {
        date: Date;
        color: string;
        width: number;
      }[];
    }[];
  }[];
}
export default function GanttChart({ items }: Readonly<GanttChartProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ganttChartCanvasRef = useRef(new GanttChartCanvas());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ganttChartCanvasRef.current.initData(items);
    ganttChartCanvasRef.current.render(canvas, window.devicePixelRatio || 1);
  }, [items]);

  return (
    <div className="overflow-auto max-h-[90vh]">
      <canvas
        ref={canvasRef}
        className="min-w-max max-w-full"
        style={{
          display: 'block'
        }}
      />
    </div>
  );
}

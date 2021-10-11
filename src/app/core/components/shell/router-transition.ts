import { trigger, animate, style, query, transition, group } from "@angular/animations";

const duration = 300;

export const routerTransition = trigger("routerTransition", [
	transition("* <=> *", [
		query(":enter, :leave", style({ position: "absolute", width: "100%", opacity: 0 })),
		group([
			query(
				":enter", [
				animate(`${duration}ms ease-in-out`, style({ opacity: 1 }))
			], { optional: true }),
			query(
				":leave", [
				animate(0, style({ display: "none" }))
			], { optional: true })
		])
	])
]);
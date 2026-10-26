import example from '../../assets/examples/minimal.cc.json?raw';

export function GET() {
	return new Response(example, { headers: { 'Content-Type': 'application/json' } });
}

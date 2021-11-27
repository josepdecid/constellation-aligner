import { DataPoint } from './types'

export function centerDataPoints(points: DataPoint[]): DataPoint[] {
    const xPoints = points.map(({ x }) => x)
    const yPoints = points.map(({ y }) => y)
    const maxX = Math.max(...xPoints)
    const minX = Math.min(...xPoints)
    const maxY = Math.max(...yPoints)
    const minY = Math.min(...yPoints)
    return points.map(({ x, y }) => ({
        x: 2 * ((x - minX) / (maxX - minX) - 0.5),
        y: 2 * ((y - minY) / (maxY - minY) - 0.5)
    }))
}

export function getRandomAlignedPointToTarget(cameraPosition: THREE.Vector3, targetPosition: THREE.Vector3): THREE.Vector3 {
    const unitary = targetPosition.sub(cameraPosition).normalize()
    // TODO: Sum from camera z offset inst
    const offset = unitary.multiplyScalar(3 + 2 *(Math.random() - 0.5))
    return cameraPosition.add(offset)
}